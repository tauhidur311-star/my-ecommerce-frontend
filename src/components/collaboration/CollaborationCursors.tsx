/**
 * Collaboration Cursors Component
 * Displays real-time cursor positions of collaborators
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { useCollaboration } from '../../hooks/useCollaboration';

interface CollaborationCursorsProps {
  designId?: string;
}

const CollaborationCursors: React.FC<CollaborationCursorsProps> = ({ designId }) => {
  const { cursors } = useCollaboration(designId);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: cursor.position.x,
              y: cursor.position.y 
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              layout: { duration: 0.1 }
            }}
            className="absolute pointer-events-none"
            style={{ left: -12, top: -12 }}
          >
            {/* Cursor */}
            <div 
              className="relative"
              style={{ color: cursor.user.color }}
            >
              <MousePointer2 
                className="w-6 h-6 transform -rotate-12 drop-shadow-lg"
                fill={cursor.user.color}
                stroke="white"
                strokeWidth={1}
              />
              
              {/* User label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 left-2 whitespace-nowrap"
              >
                <div 
                  className="px-2 py-1 rounded text-white text-xs font-medium shadow-lg"
                  style={{ backgroundColor: cursor.user.color }}
                >
                  {cursor.user.name}
                </div>
                {/* Arrow pointing to cursor */}
                <div 
                  className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent absolute -top-1 left-2"
                  style={{ borderBottomColor: cursor.user.color }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationCursors;