
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

const SectorHeader = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t('sectors')}</h1>
      <p className="text-muted-foreground">{t('sectorsDescription')}</p>
    </div>
  );
};

export default SectorHeader;
