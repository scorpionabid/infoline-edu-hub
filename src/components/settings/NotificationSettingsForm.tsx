
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationSettings } from '@/types/user';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onSubmit: (data: NotificationSettings) => void;
  loading?: boolean;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({ 
  settings, 
  onSubmit,
  loading
}) => {
  const { t } = useLanguage();
  const [formValues, setFormValues] = React.useState<NotificationSettings>(settings || {
    email: true,
    inApp: true,
    push: true,
    system: true,
    deadline: true
  });

  const handleChange = (field: keyof NotificationSettings, value: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex-1">{t('emailNotifications')}</Label>
            <Switch 
              id="email-notifications"
              checked={formValues.email}
              onCheckedChange={(checked) => handleChange('email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-notifications" className="flex-1">{t('inAppNotifications')}</Label>
            <Switch 
              id="inapp-notifications"
              checked={formValues.inApp}
              onCheckedChange={(checked) => handleChange('inApp', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex-1">{t('pushNotifications')}</Label>
            <Switch 
              id="push-notifications"
              checked={formValues.push}
              onCheckedChange={(checked) => handleChange('push', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="system-notifications" className="flex-1">{t('systemNotifications')}</Label>
            <Switch 
              id="system-notifications"
              checked={formValues.system}
              onCheckedChange={(checked) => handleChange('system', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="deadline-notifications" className="flex-1">{t('deadlineReminders')}</Label>
            <Switch 
              id="deadline-notifications"
              checked={formValues.deadline}
              onCheckedChange={(checked) => handleChange('deadline', checked)}
            />
          </div>
          
          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('saveNotificationSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default NotificationSettingsForm;
