/**
 * İnfoLine Unified Notification System - Standard Types
 * Bütün notification funksionallığı üçün vahid tip tərifləri
 */

// Core notification interface - matches database schema
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  is_read: boolean;
  priority: NotificationPriority;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
  updated_at?: string;
}

// Notification types
export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'deadline' 
  | 'approval' 
  | 'rejection'
  | 'reminder'
  | 'system'
  | 'category_update'
  | 'data_entry'
  | 'school_update'
  | 'region_update'
  | 'sector_update'
  | 'user_deleted'
  | 'user_restored';

// Notification priority levels
export type NotificationPriority = 
  | 'normal' 
  | 'high' 
  | 'critical';

// Related entity types
export type RelatedEntityType =
  | 'category'
  | 'column'
  | 'data_entry'
  | 'school'
  | 'sector'
  | 'region'
  | 'user'
  | 'system';

// Hook result interface
export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refetch: () => Promise<void>;
}

// API service interfaces
export interface CreateNotificationParams {
  userId: string;
  title: string;
  message?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: RelatedEntityType;
}

export interface BulkNotificationParams {
  userIds: string[];
  title: string;
  message?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: RelatedEntityType;
}

// Notification filters for queries
export interface NotificationFilters {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Statistics interface
export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Component prop interfaces
export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  maxItems?: number;
}

// Settings interface
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  deadline_reminders: '3_1' | '1' | 'none';
  digest_frequency: 'immediate' | 'daily' | 'weekly';
  types: NotificationType[];
  priorities: NotificationPriority[];
}

// Business logic interfaces for different notification scenarios
export interface ApprovalNotificationData {
  categoryName: string;
  categoryId: string;
  schoolName: string;
  schoolId: string;
  adminId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface DeadlineNotificationData {
  categoryName: string;
  categoryId: string;
  deadline: string;
  daysRemaining: number;
  schoolIds: string[];
}

export interface DataEntryNotificationData {
  categoryName: string;
  categoryId: string;
  schoolName: string;
  schoolId: string;
  entryCount: number;
  action: 'submitted' | 'updated' | 'completed';
}

export interface UserDeletionNotificationData {
  deletedUserId: string;
  deletedUserName: string;
  deletedByUserId: string;
  deletionType: 'soft' | 'hard';
  deletedAt: string;
}

export interface UserRestorationNotificationData {
  restoredUserId: string;
  restoredUserName: string;
  restoredByUserId: string;
  restoredAt: string;
}

// Constants for type checking and validation
export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  DEADLINE: 'deadline',
  APPROVAL: 'approval',
  REJECTION: 'rejection',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  CATEGORY_UPDATE: 'category_update',
  DATA_ENTRY: 'data_entry',
  SCHOOL_UPDATE: 'school_update',
  REGION_UPDATE: 'region_update',
  SECTOR_UPDATE: 'sector_update',
  USER_DELETED: 'user_deleted',
  USER_RESTORED: 'user_restored'
} as const;

export const NOTIFICATION_PRIORITIES: Record<string, NotificationPriority> = {
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// Type guards for runtime type checking
export const isNotificationType = (type: string): type is NotificationType => {
  return Object.values(NOTIFICATION_TYPES).includes(type as NotificationType);
};

export const isNotificationPriority = (priority: string): priority is NotificationPriority => {
  return Object.values(NOTIFICATION_PRIORITIES).includes(priority as NotificationPriority);
};

// Utility functions
export const getNotificationTypeIcon = (type: NotificationType): string => {
  switch (type) {
    case 'success':
    case 'approval':
      return '✅';
    case 'warning':
    case 'deadline':
      return '⚠️';
    case 'error':
    case 'rejection':
      return '❌';
    case 'info':
    case 'system':
      return 'ℹ️';
    default:
      return '📢';
  }
};

export const getNotificationTypeColor = (type: NotificationType): string => {
  switch (type) {
    case 'success':
    case 'approval':
      return 'green';
    case 'warning':
    case 'deadline':
      return 'yellow';
    case 'error':
    case 'rejection':
      return 'red';
    case 'info':
    case 'system':
      return 'blue';
    default:
      return 'gray';
  }
};

export const getPriorityWeight = (priority: NotificationPriority): number => {
  switch (priority) {
    case 'critical':
      return 3;
    case 'high':
      return 2;
    case 'normal':
      return 1;
    default:
      return 1;
  }
};

// Export legacy type aliases for backward compatibility
export type AppNotification = Notification;
export type DashboardNotification = Notification;
export type NotificationData = Notification;

// Export everything for easy importing
export * from './notification';

// Default export for the main interface
export default Notification;