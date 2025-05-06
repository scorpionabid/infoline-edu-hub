
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

type Language = 'az' | 'en' | 'tr' | 'ru';

export function PreferencesForm() {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  const { user, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    deadline: true,
    system: false
  });

  useEffect(() => {
    // Load user's notification settings
    if (user?.notificationSettings) {
      setNotificationSettings({
        email: user.notificationSettings.email ?? true,
        push: user.notificationSettings.inApp ?? true,
        deadline: user.notificationSettings.deadline ?? true,
        system: user.notificationSettings.system ?? false
      });
    }
  }, [user]);

  const handleLanguageChange = async (value: string) => {
    try {
      setSaving(true);
      
      // Update language in user profile
      await updateUserProfile({ language: value as Language });
      
      // Change UI language
      changeLanguage(value as Language);
      
      toast.success(t('languageUpdated'));
    } catch (error) {
      console.error('Dil dəyişdirilərkən xəta:', error);
      toast.error(t('languageUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key: string) => {
    try {
      const updatedSettings = {
        ...notificationSettings,
        [key]: !notificationSettings[key as keyof typeof notificationSettings]
      };
      
      setNotificationSettings(updatedSettings);
      
      // Update in profile
      await updateUserProfile({
        notificationSettings: {
          email: updatedSettings.email,
          inApp: updatedSettings.push,
          deadline: updatedSettings.deadline,
          system: updatedSettings.system
        }
      });
      
      toast.success(t('preferencesUpdated'));
    } catch (error) {
      console.error('Bildiriş parametrləri yenilənərkən xəta:', error);
      toast.error(t('preferencesUpdateError'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('languagePreferences')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">{t('interfaceLanguage')}</Label>
            <Select 
              value={currentLanguage} 
              onValueChange={handleLanguageChange}
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">Azərbaycan dili</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский язык</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notificationPreferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">{t('emailNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificationSettings.email}
              onCheckedChange={() => handleNotificationToggle('email')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">{t('pushNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('pushNotificationsDesc')}</p>
            </div>
            <Switch
              id="push-notifications"
              checked={notificationSettings.push}
              onCheckedChange={() => handleNotificationToggle('push')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deadline-notifications">{t('deadlineNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('deadlineNotificationsDesc')}</p>
            </div>
            <Switch
              id="deadline-notifications"
              checked={notificationSettings.deadline}
              onCheckedChange={() => handleNotificationToggle('deadline')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-notifications">{t('systemNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('systemNotificationsDesc')}</p>
            </div>
            <Switch
              id="system-notifications"
              checked={notificationSettings.system}
              onCheckedChange={() => handleNotificationToggle('system')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PreferencesForm;
