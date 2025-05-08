
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/components/settings/ProfileForm';
import NotificationSettingsForm from '@/components/settings/NotificationSettingsForm';
import LanguageSettingsForm from '@/components/settings/LanguageSettingsForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NotificationSettings } from '@/types/user';

const AccountSettings = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (data: any) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateUserProfile({
        full_name: data.full_name,
        phone: data.phone,
        position: data.position
      });
      
      toast.success(t('profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(t('errorUpdatingProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async (settings: NotificationSettings) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateUserProfile({
        notificationSettings: settings
      });
      
      toast.success(t('notificationSettingsUpdated'));
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      toast.error(t('errorUpdatingNotificationSettings'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageUpdate = async (language: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateUserProfile({
        language
      });
      
      // Update UI language
      changeLanguage(language);
      
      toast.success(t('languageUpdated'));
    } catch (error: any) {
      console.error('Error updating language:', error);
      toast.error(t('errorUpdatingLanguage'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Use notificationSettings from the user object if available, otherwise use default values
  const notificationSettings = user.notificationSettings || {
    email: true,
    inApp: true,
    push: true,
    system: true,
    deadline: true
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t('accountSettings')}</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="language">{t('language')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                user={user} 
                onSubmit={handleProfileUpdate} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationSettings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm 
                settings={notificationSettings}
                onSubmit={handleNotificationSettingsUpdate}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t('languageSettings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSettingsForm 
                currentLanguage={currentLanguage}
                onSubmit={handleLanguageUpdate}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;
