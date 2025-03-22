
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsTabs from '@/components/settings/SettingsTabs';
import { useLanguage } from '@/context/LanguageContext';

const Settings: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <div className="space-y-6 container max-w-5xl mx-auto py-4">
        <SettingsHeader />
        <SettingsTabs />
      </div>
    </SidebarLayout>
  );
};

export default Settings;
