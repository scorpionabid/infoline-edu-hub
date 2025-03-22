
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsTabs from '@/components/settings/SettingsTabs';
import { useLanguage } from '@/context/LanguageContext';
import { Separator } from '@/components/ui/separator';

const Settings: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <div className="container max-w-5xl mx-auto py-6 px-4">
        <SettingsHeader />
        <Separator className="my-6" />
        <SettingsTabs />
      </div>
    </SidebarLayout>
  );
};

export default Settings;
