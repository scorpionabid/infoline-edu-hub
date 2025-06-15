
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationSettings } from '@/types/user';

interface NotificationSectionProps {
  notificationSettings: NotificationSettings | {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    deadlineReminders: boolean;
    system: boolean;
  };
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  notificationSettings,
  onNotificationSettingsChange
}) => {
  const handleSettingChange = (key: string, value: boolean | string) => {
    const updatedSettings = {
      ...notificationSettings,
      [key]: value
    };
    
    // Convert to proper NotificationSettings format
    const properSettings: NotificationSettings = {
      email_notifications: updatedSettings.email_notifications ?? (updatedSettings as any).email ?? false,
      sms_notifications: updatedSettings.sms_notifications ?? (updatedSettings as any).sms ?? false,
      push_notifications: updatedSettings.push_notifications ?? (updatedSettings as any).inApp ?? false,
      notification_frequency: updatedSettings.notification_frequency ?? 'immediate'
    };
    
    onNotificationSettingsChange(properSettings);
  };

  const getSettingValue = (key: string, fallbackKey?: string): boolean => {
    if (key in notificationSettings) {
      return (notificationSettings as any)[key];
    }
    if (fallbackKey && fallbackKey in notificationSettings) {
      return (notificationSettings as any)[fallbackKey];
    }
    return false;
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
            checked={getSettingValue('email_notifications', 'email')}
            onCheckedChange={(checked) => handleSettingChange('email_notifications', Boolean(checked))}
          />
          <Label htmlFor="email">E-poçt bildirişləri</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="push"
            checked={getSettingValue('push_notifications', 'inApp')}
            onCheckedChange={(checked) => handleSettingChange('push_notifications', Boolean(checked))}
          />
          <Label htmlFor="push">Push bildirişlər</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sms"
            checked={getSettingValue('sms_notifications', 'sms')}
            onCheckedChange={(checked) => handleSettingChange('sms_notifications', Boolean(checked))}
          />
          <Label htmlFor="sms">SMS bildirişləri</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="deadlines"
            checked={getSettingValue('deadline', 'deadlineReminders')}
            onCheckedChange={(checked) => handleSettingChange('deadline', Boolean(checked))}
          />
          <Label htmlFor="deadlines">Son tarix xatırlatmaları</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="system"
            checked={getSettingValue('system')}
            onCheckedChange={(checked) => handleSettingChange('system', Boolean(checked))}
          />
          <Label htmlFor="system">Sistem bildirişləri</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Bildiriş tezliyi</Label>
          <Select
            value={notificationSettings.notification_frequency || 'immediate'}
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
