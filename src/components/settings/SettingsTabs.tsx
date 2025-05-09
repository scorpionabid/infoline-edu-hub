
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/context/LanguageContext';
import { Shield, Globe, Bell, Users, Mail } from 'lucide-react';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import TeamSettings from './TeamSettings';
import LanguageSettingsForm from './LanguageSettingsForm';

const SettingsTabs = () => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="account" className="space-y-4">
      <TabsList className="grid grid-cols-5 md:w-fit w-full">
        <TabsTrigger value="account" className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('account')}</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('security')}</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center">
          <Bell className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('notifications')}</span>
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center">
          <Mail className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('team')}</span>
        </TabsTrigger>
        <TabsTrigger value="language" className="flex items-center">
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('language')}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <Card>
          <CardContent className="pt-6">
            <AccountSettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security">
        <Card>
          <CardContent className="pt-6">
            <SecuritySettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardContent className="pt-6">
            <NotificationSettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="team">
        <Card>
          <CardContent className="pt-6">
            <TeamSettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="language">
        <Card>
          <CardContent className="pt-6">
            <LanguageSettingsForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
