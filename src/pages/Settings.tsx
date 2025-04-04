
import React from 'react';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsTabs from '@/components/settings/SettingsTabs';

/**
 * İstifadəçi Tənzimləmələri Səhifəsi
 */
const Settings = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('settings')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <SettingsHeader />
          <SettingsTabs />
        </div>
      </SidebarLayout>
    </>
  );
};

export default Settings;
