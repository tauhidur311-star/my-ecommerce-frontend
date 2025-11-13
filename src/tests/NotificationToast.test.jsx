import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationToast from '../components/notifications/NotificationToast';
import socketService from '../services/socketService';

// Mock socket service
jest.mock('../services/socketService', () => ({
  connect: jest.fn(),
  addListener: jest.fn(),
  isSocketConnected: jest.fn(() => true)
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  volume: 0.3
}));

describe('NotificationToast', () => {
  let mockListeners = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners = {};
    
    // Mock localStorage
    localStorageMock.getItem.mockReturnValue('true');
    
    // Mock socket service listeners
    socketService.addListener.mockImplementation((event, callback) => {
      mockListeners[event] = callback;
      // Return unsubscribe function
      return () => {
        delete mockListeners[event];
      };
    });
    
    socketService.connect.mockResolvedValue(true);
  });

  afterEach(() => {
    // Clean up any remaining timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render sound toggle button', () => {
    render(<NotificationToast />);
    
    const soundButton = screen.getByTitle(/notification sounds/i);
    expect(soundButton).toBeInTheDocument();
  });

  it('should connect to socket service on mount', async () => {
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });
    
    expect(socketService.addListener).toHaveBeenCalledWith('notification', expect.any(Function));
    expect(socketService.addListener).toHaveBeenCalledWith('adminAnnouncement', expect.any(Function));
    expect(socketService.addListener).toHaveBeenCalledWith('dashboardUpdate', expect.any(Function));
  });

  it('should display notification when received', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    // Wait for component to mount and connect
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Simulate receiving a notification
    const testNotification = {
      id: 'test-1',
      title: 'Test Notification',
      message: 'This is a test message',
      type: 'info',
      priority: 'normal'
    };

    act(() => {
      mockListeners.notification(testNotification);
    });

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should show different icons for different notification types', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Test success notification
    act(() => {
      mockListeners.notification({
        id: 'success-1',
        title: 'Success',
        message: 'Success message',
        type: 'success'
      });
    });

    expect(screen.getByText('Success')).toBeInTheDocument();
    
    // Test error notification
    act(() => {
      mockListeners.notification({
        id: 'error-1',
        title: 'Error',
        message: 'Error message',
        type: 'error'
      });
    });

    expect(screen.getByText('Error')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should remove notification when close button is clicked', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Add notification
    act(() => {
      mockListeners.notification({
        id: 'test-close',
        title: 'Test Close',
        message: 'Click to close',
        type: 'info'
      });
    });

    expect(screen.getByText('Test Close')).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole('button', { name: '' }); // Close button without accessible name
    fireEvent.click(closeButton);

    expect(screen.queryByText('Test Close')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should auto-remove notification after duration', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Add notification
    act(() => {
      mockListeners.notification({
        id: 'auto-remove',
        title: 'Auto Remove',
        message: 'Will disappear',
        type: 'info',
        priority: 'normal'
      });
    });

    expect(screen.getByText('Auto Remove')).toBeInTheDocument();

    // Fast forward time by 4 seconds (default duration for info notifications)
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Auto Remove')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should handle high priority notifications with longer duration', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Add high priority notification
    act(() => {
      mockListeners.notification({
        id: 'high-priority',
        title: 'High Priority',
        message: 'Important message',
        type: 'error',
        priority: 'high'
      });
    });

    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();

    // Should still be visible after 4 seconds
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.getByText('High Priority')).toBeInTheDocument();

    // Should be removed after 8 seconds
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('High Priority')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should toggle sound settings', () => {
    render(<NotificationToast />);
    
    const soundButton = screen.getByTitle(/notification sounds/i);
    
    // Initially enabled (mocked)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('notificationSounds');
    
    // Click to disable
    fireEvent.click(soundButton);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('notificationSounds', 'false');
    
    // Click to enable
    fireEvent.click(soundButton);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('notificationSounds', 'true');
  });

  it('should handle admin announcements', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Simulate admin announcement
    act(() => {
      mockListeners.adminAnnouncement({
        message: 'Server maintenance scheduled',
        type: 'warning',
        from: 'Admin'
      });
    });

    expect(screen.getByText('Announcement from Admin')).toBeInTheDocument();
    expect(screen.getByText('Server maintenance scheduled')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should handle dashboard alerts', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Simulate dashboard alert
    act(() => {
      mockListeners.dashboardUpdate({
        type: 'alert',
        message: 'High memory usage detected'
      });
    });

    expect(screen.getByText('Dashboard Alert')).toBeInTheDocument();
    expect(screen.getByText('High memory usage detected')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should limit number of notifications displayed', async () => {
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Add 6 notifications (should keep only 5)
    for (let i = 1; i <= 6; i++) {
      act(() => {
        mockListeners.notification({
          id: `notification-${i}`,
          title: `Notification ${i}`,
          message: `Message ${i}`,
          type: 'info'
        });
      });
    }

    // Should only show notifications 2-6 (latest 5)
    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
    expect(screen.getByText('Notification 2')).toBeInTheDocument();
    expect(screen.getByText('Notification 6')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should handle notification clicks with action URLs', async () => {
    // Mock window.open
    const mockOpen = jest.fn();
    global.window.open = mockOpen;
    
    jest.useFakeTimers();
    
    render(<NotificationToast />);
    
    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    // Add notification with action URL
    act(() => {
      mockListeners.notification({
        id: 'clickable',
        title: 'Clickable Notification',
        message: 'Click to open',
        type: 'info',
        actionUrl: 'https://example.com'
      });
    });

    const notification = screen.getByText('Clickable Notification').closest('div');
    fireEvent.click(notification);

    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank');
    expect(screen.queryByText('Clickable Notification')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });
});