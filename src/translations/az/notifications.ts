
// Notifications translation module
export const notifications = {
  // Basic terms
  notification: 'Bildiriş',
  notifications: 'Bildirişlər',
  
  // Actions
  mark_read: 'Oxunmuş kimi işarələ',
  clear_all: 'Hamısını təmizlə',
  
  // Messages
  no_notifications: 'Bildiriş yoxdur',
  new_notification: 'Yeni bildiriş'
} as const;

export type Notifications = typeof notifications;
export default notifications;
