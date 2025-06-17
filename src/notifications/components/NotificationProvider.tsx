/**
 * İnfoLine Unified Notification System - Provider Component
 * React context və provider komponenti
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '../hooks';
import type { UnifiedNotification, NotificationEvent } from '../core/types';

interface NotificationContextType {
  notifications: UnifiedNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface UnifiedNotificationProviderProps {
  children: ReactNode;
  userId?: string;
  enableToasts?: boolean;
  toastConfig?: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    duration?: number;
    showOnlyHighPriority?: boolean;
  };
}

export const UnifiedNotificationProvider: React.FC<UnifiedNotificationProviderProps> = ({
  children,
  userId,
  enableToasts = true,
  toastConfig = {
    position: 'top-right',
    duration: 5000,
    showOnlyHighPriority: false
  }
}) => {
  const notificationHook = useNotifications(userId);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch
  } = notificationHook;

  // Show toast notifications for new notifications
  useEffect(() => {
    if (!enableToasts || !notifications.length) return;

    // Get the most recent notification
    const latestNotification = notifications[0];
    
    // Check if this is a new notification (created in the last minute)
    const isRecent = new Date(latestNotification.created_at).getTime() > Date.now() - 60000;
    
    if (isRecent && !latestNotification.is_read) {
      // Check priority filter
      if (toastConfig.showOnlyHighPriority && 
          !['high', 'critical'].includes(latestNotification.priority)) {
        return;
      }

      const toastOptions = {
        duration: toastConfig.duration,
        action: {
          label: 'Oxu',
          onClick: () => markAsRead(latestNotification.id)
        }
      };

      // Show different toast types based on notification type
      switch (latestNotification.type) {
        case 'success':
        case 'approval':
          toast.success(latestNotification.title, {
            description: latestNotification.message,
            ...toastOptions
          });
          break;
          
        case 'error':
        case 'rejection':
          toast.error(latestNotification.title, {
            description: latestNotification.message,
            ...toastOptions
          });
          break;
          
        case 'warning':
        case 'deadline':
          toast.warning(latestNotification.title, {
            description: latestNotification.message,
            ...toastOptions
          });
          break;
          
        case 'info':
        case 'system':
        default:
          toast.info(latestNotification.title, {
            description: latestNotification.message,
            ...toastOptions
          });
          break;
      }
    }
  }, [notifications, enableToasts, toastConfig, markAsRead]);

  // Update document title with unread count
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
    
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [unreadCount]);

  // Add custom CSS for notification toasts
  useEffect(() => {
    if (!enableToasts) return;

    const styleId = 'infoline-notification-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .infoline-notification-toast {
        border-left: 4px solid #3b82f6;
      }
      
      .infoline-notification-toast.success {
        border-left-color: #10b981;
      }
      
      .infoline-notification-toast.error {
        border-left-color: #ef4444;
      }
      
      .infoline-notification-toast.warning {
        border-left-color: #f59e0b;
      }
      
      .infoline-notification-toast.critical {
        border-left-color: #dc2626;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [enableToasts]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use the notification context
 */
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a UnifiedNotificationProvider');
  }
  return context;
};

/**
 * HOC for components that need notification access
 */
export function withNotifications<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { notifications?: NotificationContextType }> {
  return function WrappedComponent(props: P) {
    const notifications = useNotificationContext();
    
    return <Component {...props} notifications={notifications} />;
  };
}

/**
 * Legacy compatibility provider - replaces old NotificationContext.tsx
 */
export const NotificationProvider = UnifiedNotificationProvider;

export default {
  UnifiedNotificationProvider,
  NotificationProvider,
  useNotificationContext,
  withNotifications
};
