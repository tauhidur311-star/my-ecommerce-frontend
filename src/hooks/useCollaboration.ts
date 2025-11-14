/**
 * Collaboration Hooks
 * React hooks for real-time collaboration features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import useAdvancedPageBuilderStore from '../stores/advancedPageBuilderStore';

interface CollaboratorCursor {
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    color: string;
  };
  position: {
    x: number;
    y: number;
    sectionId?: string;
  };
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isEditing?: string; // sectionId if editing
  lastSeen: Date;
}

interface CollaborationState {
  isConnected: boolean;
  collaborators: Collaborator[];
  cursors: CollaboratorCursor[];
  editingLocks: Map<string, string>; // sectionId -> userId
  typingIndicators: Map<string, Set<string>>; // sectionId -> Set of userIds
}

// ====================
// MAIN COLLABORATION HOOK
// ====================

export const useCollaboration = (designId?: string) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isConnected: false,
    collaborators: [],
    cursors: [],
    editingLocks: new Map(),
    typingIndicators: new Map(),
  });

  const {
    sections,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    undo,
    redo
  } = useAdvancedPageBuilderStore();

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setCollaborationState(prev => ({ ...prev, isConnected: true }));
    });

    newSocket.on('disconnect', () => {
      setCollaborationState(prev => ({ 
        ...prev, 
        isConnected: false,
        collaborators: [],
        cursors: []
      }));
    });

    newSocket.on('error', (error) => {
      console.error('Collaboration error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token]);

  // Join/leave design room
  useEffect(() => {
    if (!socket || !designId) return;

    socket.emit('join-design', { designId, permissions: 'edit' });

    return () => {
      socket.emit('leave-design', { designId });
    };
  }, [socket, designId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // User presence events
    socket.on('user-joined', (data) => {
      setCollaborationState(prev => ({
        ...prev,
        collaborators: data.collaborators
      }));
    });

    socket.on('user-left', (data) => {
      setCollaborationState(prev => ({
        ...prev,
        collaborators: data.collaborators,
        cursors: prev.cursors.filter(cursor => cursor.userId !== data.userId)
      }));
    });

    // Cursor events
    socket.on('cursor-update', (data) => {
      setCollaborationState(prev => ({
        ...prev,
        cursors: [
          ...prev.cursors.filter(cursor => cursor.userId !== data.userId),
          data
        ]
      }));
    });

    // Section editing events
    socket.on('section-edit-started', (data) => {
      setCollaborationState(prev => {
        const newLocks = new Map(prev.editingLocks);
        newLocks.set(data.sectionId, data.editor.id);
        return { ...prev, editingLocks: newLocks };
      });
    });

    socket.on('section-edit-ended', (data) => {
      setCollaborationState(prev => {
        const newLocks = new Map(prev.editingLocks);
        newLocks.delete(data.sectionId);
        return { ...prev, editingLocks: newLocks };
      });
    });

    socket.on('section-locked', (data) => {
      // Handle section lock notification
      console.warn(`Section ${data.sectionId} is being edited by ${data.editor.name}`);
    });

    // Real-time updates
    socket.on('section-updated', (data) => {
      updateSection(data.sectionId, data.updates);
    });

    socket.on('section-added', (data) => {
      addSection(data.section.type, data.index, data.section.preset);
    });

    socket.on('section-deleted', (data) => {
      removeSection(data.sectionId);
    });

    socket.on('sections-reordered', (data) => {
      reorderSections(data.startIndex, data.endIndex);
    });

    // Undo/Redo events
    socket.on('design-undone', (data) => {
      // Sync undo state
      undo();
    });

    socket.on('design-redone', (data) => {
      // Sync redo state
      redo();
    });

    // Typing indicators
    socket.on('typing-started', (data) => {
      setCollaborationState(prev => {
        const newIndicators = new Map(prev.typingIndicators);
        if (!newIndicators.has(data.sectionId)) {
          newIndicators.set(data.sectionId, new Set());
        }
        newIndicators.get(data.sectionId)!.add(data.user.id);
        return { ...prev, typingIndicators: newIndicators };
      });
    });

    socket.on('typing-ended', (data) => {
      setCollaborationState(prev => {
        const newIndicators = new Map(prev.typingIndicators);
        if (newIndicators.has(data.sectionId)) {
          newIndicators.get(data.sectionId)!.delete(data.userId);
          if (newIndicators.get(data.sectionId)!.size === 0) {
            newIndicators.delete(data.sectionId);
          }
        }
        return { ...prev, typingIndicators: newIndicators };
      });
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-update');
      socket.off('section-edit-started');
      socket.off('section-edit-ended');
      socket.off('section-locked');
      socket.off('section-updated');
      socket.off('section-added');
      socket.off('section-deleted');
      socket.off('sections-reordered');
      socket.off('design-undone');
      socket.off('design-redone');
      socket.off('typing-started');
      socket.off('typing-ended');
    };
  }, [socket, updateSection, addSection, removeSection, reorderSections, undo, redo]);

  // Collaboration actions
  const sendCursorPosition = useCallback((position: { x: number; y: number; sectionId?: string }) => {
    if (socket && designId) {
      socket.emit('cursor-move', { designId, position });
    }
  }, [socket, designId]);

  const startSectionEdit = useCallback((sectionId: string) => {
    if (socket && designId) {
      socket.emit('section-edit-start', { designId, sectionId });
    }
  }, [socket, designId]);

  const endSectionEdit = useCallback((sectionId: string) => {
    if (socket && designId) {
      socket.emit('section-edit-end', { designId, sectionId });
    }
  }, [socket, designId]);

  const broadcastSectionUpdate = useCallback((sectionId: string, updates: any, version?: number) => {
    if (socket && designId) {
      socket.emit('section-update', { designId, sectionId, updates, version });
    }
  }, [socket, designId]);

  const broadcastSectionAdd = useCallback((section: any, index?: number) => {
    if (socket && designId) {
      socket.emit('section-add', { designId, section, index });
    }
  }, [socket, designId]);

  const broadcastSectionDelete = useCallback((sectionId: string) => {
    if (socket && designId) {
      socket.emit('section-delete', { designId, sectionId });
    }
  }, [socket, designId]);

  const broadcastSectionsReorder = useCallback((startIndex: number, endIndex: number) => {
    if (socket && designId) {
      socket.emit('sections-reorder', { designId, startIndex, endIndex });
    }
  }, [socket, designId]);

  const broadcastUndo = useCallback(() => {
    if (socket && designId) {
      socket.emit('undo', { designId });
    }
  }, [socket, designId]);

  const broadcastRedo = useCallback(() => {
    if (socket && designId) {
      socket.emit('redo', { designId });
    }
  }, [socket, designId]);

  const startTyping = useCallback((sectionId: string, field?: string) => {
    if (socket && designId) {
      socket.emit('typing-start', { designId, sectionId, field });
    }
  }, [socket, designId]);

  const endTyping = useCallback((sectionId: string, field?: string) => {
    if (socket && designId) {
      socket.emit('typing-end', { designId, sectionId, field });
    }
  }, [socket, designId]);

  return {
    ...collaborationState,
    actions: {
      sendCursorPosition,
      startSectionEdit,
      endSectionEdit,
      broadcastSectionUpdate,
      broadcastSectionAdd,
      broadcastSectionDelete,
      broadcastSectionsReorder,
      broadcastUndo,
      broadcastRedo,
      startTyping,
      endTyping,
    }
  };
};

// ====================
// CURSOR TRACKING HOOK
// ====================

export const useCursorTracking = (designId?: string) => {
  const { sendCursorPosition } = useCollaboration(designId).actions;
  const lastPosition = useRef({ x: 0, y: 0 });
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

  const trackCursor = useCallback((event: MouseEvent, sectionId?: string) => {
    const position = {
      x: event.clientX,
      y: event.clientY,
      sectionId
    };

    // Throttle cursor updates
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }

    throttleTimeout.current = setTimeout(() => {
      const distance = Math.sqrt(
        Math.pow(position.x - lastPosition.current.x, 2) +
        Math.pow(position.y - lastPosition.current.y, 2)
      );

      // Only send if cursor moved significantly
      if (distance > 10) {
        sendCursorPosition(position);
        lastPosition.current = position;
      }
    }, 100); // 100ms throttle
  }, [sendCursorPosition]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      trackCursor(event);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [trackCursor]);

  return { trackCursor };
};

// ====================
// SECTION EDITING HOOK
// ====================

export const useSectionEditing = (sectionId: string, designId?: string) => {
  const { 
    editingLocks, 
    actions: { startSectionEdit, endSectionEdit, startTyping, endTyping }
  } = useCollaboration(designId);

  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const lockUserId = editingLocks.get(sectionId);
    setIsLocked(!!lockUserId);
  }, [editingLocks, sectionId]);

  const startEditing = useCallback(() => {
    if (!isLocked) {
      startSectionEdit(sectionId);
      setIsEditing(true);
    }
  }, [isLocked, startSectionEdit, sectionId]);

  const stopEditing = useCallback(() => {
    endSectionEdit(sectionId);
    setIsEditing(false);
  }, [endSectionEdit, sectionId]);

  const handleTyping = useCallback((field?: string) => {
    startTyping(sectionId, field);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to end typing
    typingTimeoutRef.current = setTimeout(() => {
      endTyping(sectionId, field);
    }, 2000); // 2 seconds of inactivity
  }, [startTyping, endTyping, sectionId]);

  const stopTyping = useCallback((field?: string) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    endTyping(sectionId, field);
  }, [endTyping, sectionId]);

  return {
    isEditing,
    isLocked,
    startEditing,
    stopEditing,
    handleTyping,
    stopTyping
  };
};

// ====================
// TYPING INDICATOR HOOK
// ====================

export const useTypingIndicator = (sectionId: string, designId?: string) => {
  const { typingIndicators, collaborators } = useCollaboration(designId);
  
  const typingUsers = typingIndicators.get(sectionId);
  const typingCollaborators = collaborators.filter(
    collaborator => typingUsers?.has(collaborator.id)
  );

  return {
    isAnyoneTyping: typingCollaborators.length > 0,
    typingUsers: typingCollaborators
  };
};

// ====================
// PRESENCE INDICATOR HOOK
// ====================

export const usePresenceIndicator = (designId?: string) => {
  const { isConnected, collaborators } = useCollaboration(designId);
  
  return {
    isConnected,
    collaboratorCount: collaborators.length,
    collaborators
  };
};

export default useCollaboration;