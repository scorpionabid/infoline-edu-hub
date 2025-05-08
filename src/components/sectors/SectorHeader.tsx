
import React from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';

const SectorHeader = () => {
  const { t } = useLanguageSafe();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t('sectors')}</h1>
      <p className="text-muted-foreground">{t('sectorsDescription')}</p>
    </div>
  );
};

export default SectorHeader;
