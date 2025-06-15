
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationSettings } from '@/types/user';

interface NotificationSectionProps {
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  notificationSettings,
  onNotificationSettingsChange
}) => {
  const handleSettingChange = (key: string, value: boolean | string) => {
    const updatedSettings: NotificationSettings = {
      ...notificationSettings,
      [key]: value
    };
    
    onNotificationSettingsChange(updatedSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bildiriş Ayarları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="email"
            checked={notificationSettings.email_notifications}
            onCheckedChange={(checked) => handleSettingChange('email_notifications', Boolean(checked))}
          />
          <Label htmlFor="email">E-poçt bildirişləri</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="push"
            checked={notificationSettings.push_notifications}
            onCheckedChange={(checked) => handleSettingChange('push_notifications', Boolean(checked))}
          />
          <Label htmlFor="push">Push bildirişlər</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sms"
            checked={notificationSettings.sms_notifications}
            onCheckedChange={(checked) => handleSettingChange('sms_notifications', Boolean(checked))}
          />
          <Label htmlFor="sms">SMS bildirişləri</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Bildiriş tezliyi</Label>
          <Select
            value={notificationSettings.notification_frequency}
            onValueChange={(value) => handleSettingChange('notification_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tezlik seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Dərhal</SelectItem>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Həftəlik</SelectItem>
              <SelectItem value="never">Heç vaxt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSection;
