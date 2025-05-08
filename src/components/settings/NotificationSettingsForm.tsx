
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NotificationSettings } from '@/types/user';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onSubmit: (settings: NotificationSettings) => void;
  loading?: boolean;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  settings,
  onSubmit,
  loading
}) => {
  const { t } = useLanguage();
  const [formState, setFormState] = React.useState<NotificationSettings>(settings);

  const handleChange = (key: keyof NotificationSettings, value: boolean) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications" className="font-medium">
              {t('emailNotifications')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('emailNotificationsDesc')}
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={formState.email}
            onCheckedChange={(checked) => handleChange('email', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications" className="font-medium">
              {t('pushNotifications')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('pushNotificationsDesc')}
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={formState.push}
            onCheckedChange={(checked) => handleChange('push', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="system-notifications" className="font-medium">
              {t('systemNotifications')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('systemNotificationsDesc')}
            </p>
          </div>
          <Switch
            id="system-notifications"
            checked={formState.system}
            onCheckedChange={(checked) => handleChange('system', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="deadline-reminders" className="font-medium">
              {t('deadlineReminders')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('deadlineRemindersDesc')}
            </p>
          </div>
          <Switch
            id="deadline-reminders"
            checked={formState.deadline}
            onCheckedChange={(checked) => handleChange('deadline', checked)}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? t('saving') : t('saveNotificationSettings')}
      </Button>
    </form>
  );
};

export default NotificationSettingsForm;
