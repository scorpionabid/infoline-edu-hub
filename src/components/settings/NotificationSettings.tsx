
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const { t } = useLanguage();
  
  const [notifications, setNotifications] = React.useState({
    emailNewCategory: true,
    emailDeadline: true,
    emailReminder: false,
    systemNewCategory: true,
    systemDeadline: true,
    systemReminder: true,
    systemUpdateNotice: true,
    dailyDigest: false,
    weeklyDigest: true,
  });
  
  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const saveSettings = () => {
    // In a real app, you would call an API to save these settings
    toast.success(t('notificationSettingsSaved'));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationPreferences')}</CardTitle>
        <CardDescription>
          {t('notificationPreferencesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('emailNotifications')}</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('newCategoryNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('newCategoryNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.emailNewCategory} 
              onCheckedChange={() => handleToggle('emailNewCategory')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('deadlineNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('deadlineNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.emailDeadline} 
              onCheckedChange={() => handleToggle('emailDeadline')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('reminderNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('reminderNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.emailReminder} 
              onCheckedChange={() => handleToggle('emailReminder')} 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('systemNotifications')}</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('newCategoryNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('newCategoryNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.systemNewCategory} 
              onCheckedChange={() => handleToggle('systemNewCategory')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('deadlineNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('deadlineNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.systemDeadline} 
              onCheckedChange={() => handleToggle('systemDeadline')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('reminderNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('reminderNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.systemReminder} 
              onCheckedChange={() => handleToggle('systemReminder')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('systemUpdateNotification')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('systemUpdateNotificationDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.systemUpdateNotice} 
              onCheckedChange={() => handleToggle('systemUpdateNotice')} 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('digestSettings')}</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('dailyDigest')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('dailyDigestDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.dailyDigest} 
              onCheckedChange={() => handleToggle('dailyDigest')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('weeklyDigest')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('weeklyDigestDesc')}
              </p>
            </div>
            <Switch 
              checked={notifications.weeklyDigest} 
              onCheckedChange={() => handleToggle('weeklyDigest')} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveSettings}>
          {t('saveNotificationSettings')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
