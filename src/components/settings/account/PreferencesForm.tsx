
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PreferencesForm = () => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Notification preferences from user data or default values
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: user?.notificationSettings?.email !== false,
    push: user?.notificationSettings?.push !== false,
    deadline: user?.notificationSettings?.deadline !== false,
    system: user?.notificationSettings?.system !== false
  });

  const handleLanguageChange = async (value: string) => {
    try {
      setIsLoading(true);
      await updateUser({ language: value });
      setLanguage(value);
      toast.success(t('languageUpdated'));
    } catch (error: any) {
      console.error('Language update error:', error);
      toast.error(t('languageUpdateError'), {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      setIsLoading(true);
      const newPrefs = { ...notificationPrefs, [key]: value };
      setNotificationPrefs(newPrefs);
      
      await updateUser({
        notificationSettings: {
          email: newPrefs.email,
          push: newPrefs.push,
          deadline: newPrefs.deadline,
          system: newPrefs.system
        }
      });
      
      toast.success(t('preferencesUpdated'));
    } catch (error: any) {
      console.error('Preferences update error:', error);
      toast.error(t('preferencesUpdateError'), {
        description: error.message,
      });
      // Revert UI state on error
      setNotificationPrefs(notificationPrefs);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t('languagePreferences')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="language">{t('interfaceLanguage')}</Label>
            <Select
              value={currentLanguage}
              onValueChange={handleLanguageChange}
              disabled={isLoading}
              id="language"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="ru">{t('russian')}</SelectItem>
                <SelectItem value="tr">{t('turkish')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t('notificationPreferences')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base">
                {t('emailNotifications')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('emailNotificationsDescription')}
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificationPrefs.email}
              onCheckedChange={(value) => handleNotificationChange('email', value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="app-notifications" className="text-base">
                {t('inAppNotifications')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('inAppNotificationsDescription')}
              </p>
            </div>
            <Switch
              id="app-notifications"
              checked={notificationPrefs.push}
              onCheckedChange={(value) => handleNotificationChange('push', value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deadline-notifications" className="text-base">
                {t('deadlineReminders')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('deadlineRemindersDescription')}
              </p>
            </div>
            <Switch
              id="deadline-notifications"
              checked={notificationPrefs.deadline}
              onCheckedChange={(value) => handleNotificationChange('deadline', value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-notifications" className="text-base">
                {t('systemNotifications')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('systemNotificationsDescription')}
              </p>
            </div>
            <Switch
              id="system-notifications"
              checked={notificationPrefs.system}
              onCheckedChange={(value) => handleNotificationChange('system', value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PreferencesForm;
