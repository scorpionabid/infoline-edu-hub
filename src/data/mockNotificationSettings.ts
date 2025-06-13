import { FullUserData } from '@/types/auth';
import { NotificationSettings } from '@/types/auth';

export const defaultNotificationSettings: NotificationSettings = {
  email: true,
  push: true,
  inApp: true,
  system: true,
  deadline: true,
  sms: false,
  deadlineReminders: true,
  statusUpdates: true,
  weeklyReports: false
};

export const mockUserSettings: { [userId: string]: NotificationSettings } = {
  'user1': {
    email: false,
    push: true,
    inApp: true,
    system: false,
    deadline: true,
    sms: false,
    deadlineReminders: true,
    statusUpdates: false,
    weeklyReports: false
  },
  'user2': {
    email: true,
    push: false,
    inApp: true,
    system: true,
    deadline: false,
    sms: true,
    deadlineReminders: false,
    statusUpdates: true,
    weeklyReports: true
  }
};
