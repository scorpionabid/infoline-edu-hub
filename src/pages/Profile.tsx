
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import ProfileSettings from '@/components/settings/ProfileSettings';
import PreferencesForm from '@/components/settings/account/PreferencesForm';
import PasswordChangeForm from '@/components/settings/account/PasswordChangeForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { t } = useLanguage();
  // Use updateProfile instead of updateUser
  const { user, updateProfile } = useAuth();

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('profile')}</h1>
        <p className="text-muted-foreground">{t('profileSettings')}</p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="account">{t('account')}</TabsTrigger>
          <TabsTrigger value="password">{t('password')}</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="account">
            <PreferencesForm />
          </TabsContent>
          
          <TabsContent value="password">
            <PasswordChangeForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Profile;
