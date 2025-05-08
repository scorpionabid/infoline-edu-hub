
import { NotificationSettings } from "@/types/user";

// Standart bildiriş ayarları şablonu
export const defaultNotificationSettings: NotificationSettings = {
  email: true,
  inApp: true,
  push: true,
  system: true,
  deadline: true,
  sms: false,
  deadlineReminders: true
};

// Mock data üçün legacy notificationSettings-ləri yeni formata çevirmək
export const adaptLegacyNotificationSettings = (legacySettings: any): NotificationSettings => {
  return {
    email: legacySettings?.email || true,
    inApp: true, // Əksik olan məcburi xassələri default dəyərlərə mənimsədirik
    push: legacySettings?.push || false,
    system: legacySettings?.system || true,
    deadline: true, // Əksik olan məcburi xassələri default dəyərlərə mənimsədirik
    sms: legacySettings?.sms || false,
    deadlineReminders: legacySettings?.deadlineReminders || true
  };
};
