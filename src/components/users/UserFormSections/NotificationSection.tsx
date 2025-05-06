
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/LanguageContext';
import { UserFormData } from '@/types/user';

interface NotificationSectionProps {
  formData: UserFormData;
  onChange: (name: string, value: any) => void;
  isDisabled?: boolean;
}

export const NotificationSection: React.FC<NotificationSectionProps> = ({
  formData,
  onChange,
  isDisabled
}) => {
  const { t } = useLanguage();

  // Əgər notificationSettings yoxdursa, standart dəyərlər təyin et
  const notificationSettings = formData.notificationSettings || {
    email: true,
    inApp: true,
    sms: false,
    deadlineReminders: true,
    system: true
  };

  const handleNotificationChange = (field: string, checked: boolean) => {
    // notificationSettings daxilində dəyəri dəyişdirik
    const updatedSettings = {
      ...notificationSettings,
      [field]: checked
    };

    // formData-ya yeni notificationSettings dəyərini ötürürük
    onChange('notificationSettings', updatedSettings);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">{t('emailNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
            </div>
            <Switch
              id="email-notifications"
              checked={Boolean(notificationSettings.email)}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inapp-notifications">{t('inAppNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('inAppNotificationsDesc')}</p>
            </div>
            <Switch
              id="inapp-notifications"
              checked={Boolean(notificationSettings.inApp)}
              onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">{t('smsNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('smsNotificationsDesc')}</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={Boolean(notificationSettings.sms)}
              onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deadline-notifications">{t('deadlineNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('deadlineNotificationsDesc')}</p>
            </div>
            <Switch
              id="deadline-notifications"
              checked={Boolean(notificationSettings.deadlineReminders)}
              onCheckedChange={(checked) => handleNotificationChange('deadlineReminders', checked)}
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-notifications">{t('systemNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('systemNotificationsDesc')}</p>
            </div>
            <Switch
              id="system-notifications"
              checked={Boolean(notificationSettings.system)}
              onCheckedChange={(checked) => handleNotificationChange('system', checked)}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSection;
