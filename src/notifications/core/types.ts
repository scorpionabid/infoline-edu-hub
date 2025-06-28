/**
 * İnfoLine Unified Notification System - Core Types
 * Bütün notification funksionallığı üçün ümumi tiplər
 */

// Base notification interface
export interface UnifiedNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  is_read: boolean;
  priority: NotificationPriority;
  channel?: NotificationChannel;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  metadata?: NotificationMetadata;
  actions?: NotificationAction[];
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
  | 'sector_update';

// Bulk notification request interface for batch operations
export interface BulkNotificationRequest {
  user_ids?: string[];
  type?: NotificationType;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
}

// Notification priority levels
export type NotificationPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'critical';

// Notification delivery channels
export type NotificationChannel = 
  | 'email' 
  | 'push' 
  | 'inApp' 
  | 'sms'
  | 'system';

// Notification status for delivery tracking
export type NotificationStatus = 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed' 
  | 'pending'
  | 'cancelled';

// Additional metadata for different notification types
export interface NotificationMetadata {
  // For deadline notifications
  deadline_date?: string;
  days_remaining?: number;
  
  // For approval/rejection notifications
  approval_status?: 'approved' | 'rejected' | 'pending';
  reviewer_id?: string;
  reviewer_name?: string;
  rejection_reason?: string;
  
  // For data entry notifications
  category_id?: string;
  category_name?: string;
  school_id?: string;
  school_name?: string;
  completion_percentage?: number;
  
  // For system notifications
  version?: string;
  maintenance_window?: string;
  
  // Email specific
  email_template?: string;
  email_subject?: string;
  
  // Push notification specific
  push_title?: string;
  push_body?: string;
  push_icon?: string;
  
  // Custom data
  custom_data?: Record<string, any>;
}

// Notification actions (for interactive notifications)
export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dismiss';
  style: 'primary' | 'secondary' | 'danger' | 'success';
  action: string; // URL or function name
  metadata?: Record<string, any>;
}

// Notification settings for users
export interface NotificationSettings {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  
  // Type-specific settings
  deadline_notifications: boolean;
  approval_notifications: boolean;
  system_notifications: boolean;
  daily_digest: boolean;
  
  // Timing preferences
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string;
  timezone?: string;
  
  // Frequency settings
  digest_frequency: 'daily' | 'weekly' | 'never';
  priority_filter: NotificationPriority[]; // Only show these priorities
  
  created_at: string;
  updated_at: string;
}

// Notification template for different types
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  title_template: string;
  message_template: string;
  
  // Multi-language support
  translations: Record<string, {
    title: string;
    message: string;
  }>;
  
  // Channel-specific templates
  email_template?: string;
  push_template?: string;
  sms_template?: string;
  
  // Template variables
  variables: string[];
  
  // Default settings
  default_priority: NotificationPriority;
  default_channels: NotificationChannel[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Bulk notification request
export interface BulkNotificationRequest {
  template_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  
  // Target users
  user_ids?: string[];
  role_filter?: string[]; // Target specific roles
  region_filter?: string[]; // Target specific regions
  sector_filter?: string[]; // Target specific sectors
  school_filter?: string[]; // Target specific schools
  
  // Scheduling
  send_at?: string; // ISO date string
  expires_at?: string;
  
  // Metadata
  metadata?: NotificationMetadata;
  actions?: NotificationAction[];
}

// Notification analytics
export interface NotificationAnalytics {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  total_failed: number;
  
  // By type
  by_type: Record<NotificationType, {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  
  // By channel
  by_channel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  
  // By priority
  by_priority: Record<NotificationPriority, {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  
  // Time-based analytics
  daily_stats: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  
  // Performance metrics
  average_delivery_time: number; // milliseconds
  average_read_time: number; // milliseconds
  bounce_rate: number; // percentage
  engagement_rate: number; // percentage
}

// Real-time notification event
export interface NotificationEvent {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted' | 'notification_read';
  notification: UnifiedNotification;
  user_id: string;
  timestamp: string;
}

// Notification manager configuration
export interface NotificationManagerConfig {
  // Real-time settings
  enableRealTime: boolean;
  realtimeChannel: string;
  
  // Caching settings
  cacheNotifications: boolean;
  cacheExpiry: number;
  maxCacheSize: number;
  
  // Batch processing
  batchSize: number;
  batchDelay: number;
  
  // Retry settings
  maxRetries: number;
  retryDelay: number;
  
  // Analytics
  enableAnalytics: boolean;
  analyticsRetention: number; // days
  
  // Performance
  enableDebug: boolean;
  enablePerformanceTracking: boolean;
}

// Constants
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low' as const,
  NORMAL: 'normal' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const
};

export const NOTIFICATION_TYPES = {
  INFO: 'info' as const,
  SUCCESS: 'success' as const,
  WARNING: 'warning' as const,
  ERROR: 'error' as const,
  DEADLINE: 'deadline' as const,
  APPROVAL: 'approval' as const,
  REJECTION: 'rejection' as const,
  REMINDER: 'reminder' as const,
  SYSTEM: 'system' as const,
  CATEGORY_UPDATE: 'category_update' as const,
  DATA_ENTRY: 'data_entry' as const,
  SCHOOL_UPDATE: 'school_update' as const,
  REGION_UPDATE: 'region_update' as const,
  SECTOR_UPDATE: 'sector_update' as const
};

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email' as const,
  PUSH: 'push' as const,
  IN_APP: 'inApp' as const,
  SMS: 'sms' as const,
  SYSTEM: 'system' as const
};

export const NOTIFICATION_STATUS = {
  SENT: 'sent' as const,
  DELIVERED: 'delivered' as const,
  READ: 'read' as const,
  FAILED: 'failed' as const,
  PENDING: 'pending' as const,
  CANCELLED: 'cancelled' as const
};

// Default configuration
export const DEFAULT_NOTIFICATION_CONFIG: NotificationManagerConfig = {
  enableRealTime: true,
  realtimeChannel: 'infoline_notifications',
  cacheNotifications: true,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes
  maxCacheSize: 100,
  batchSize: 50,
  batchDelay: 1000, // 1 second
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  enableAnalytics: true,
  analyticsRetention: 30, // 30 days
  enableDebug: false,
  enablePerformanceTracking: true
};

// No default export to avoid circular dependency issues
// Use named exports instead
