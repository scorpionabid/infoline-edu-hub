
export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'normal' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  user_id: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  todayNotifications: number;
  thisWeekNotifications: number;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  system_notifications: boolean;
  data_entry_notifications: boolean;
  approval_notifications: boolean;
  deadline_notifications: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  language: string;
  priority_filter: string[];
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  deadline_reminders: string;
  category_preferences: Record<string, boolean>;
}
