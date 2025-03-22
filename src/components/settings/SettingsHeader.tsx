
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const SettingsHeader: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">{t('settings')}</h2>
      <p className="text-muted-foreground">
        {t('settingsDescription')}
      </p>
    </div>
  );
};

export default SettingsHeader;
