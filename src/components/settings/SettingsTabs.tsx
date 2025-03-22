
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';

const SettingsTabs: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-4 w-full max-w-xl mb-6">
        <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
        <TabsTrigger value="account">{t('account')}</TabsTrigger>
        <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
        <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-6">
        <ProfileSettings />
      </TabsContent>
      
      <TabsContent value="account" className="space-y-6">
        <AccountSettings />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings />
      </TabsContent>
      
      <TabsContent value="appearance" className="space-y-6">
        <AppearanceSettings />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
