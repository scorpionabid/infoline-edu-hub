
/**
 * İnfoLine Unified Notification System - Main Export
 * Bütün notification funksionallığı üçün mərkəzi eksport nöqtəsi
 */

// Core exports
export * from './core/types';
export { UnifiedNotificationManager, notificationManager } from './core/NotificationManager';

// Component exports
export { UnifiedNotificationProvider } from './components/NotificationProvider';

// Hook exports
export { useUnifiedNotifications } from '@/hooks/notifications/useUnifiedNotifications';

// Alias for main hook (backward compatibility)
export { useUnifiedNotifications as useNotifications } from '@/hooks/notifications/useUnifiedNotifications';

// Service exports
export { default as approvalNotificationService } from '@/services/notifications/approvalNotificationService';

// Re-exports for convenience
export { default as notificationManager } from './core/NotificationManager';
