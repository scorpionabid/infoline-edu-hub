
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/common/useToast';

export const NotificationSettings: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    deadlineReminders: true,
    weeklyReports: false,
    systemAlerts: true
  });

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    // Save logic here
    toast({
      title: t('settingsSaved'),
      description: t('settingsSavedDescription')
    });
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: false,
      deadlineReminders: true,
      weeklyReports: false,
      systemAlerts: true
    });
    
    toast({
      title: t('settingsReset'),
      description: t('settingsResetDescription')
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationSettings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">
              {t('emailNotifications')}
            </Label>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleSettingChange('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">
              {t('pushNotifications')}
            </Label>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={() => handleSettingChange('pushNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="deadline-reminders">
              {t('deadlineReminders')}
            </Label>
            <Switch
              id="deadline-reminders"
              checked={settings.deadlineReminders}
              onCheckedChange={() => handleSettingChange('deadlineReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-reports">
              {t('weeklyReports')}
            </Label>
            <Switch
              id="weekly-reports"
              checked={settings.weeklyReports}
              onCheckedChange={() => handleSettingChange('weeklyReports')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="system-alerts">
              {t('systemAlerts')}
            </Label>
            <Switch
              id="system-alerts"
              checked={settings.systemAlerts}
              onCheckedChange={() => handleSettingChange('systemAlerts')}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleSave}>
            {t('saveSettings')}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            {t('resetSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
