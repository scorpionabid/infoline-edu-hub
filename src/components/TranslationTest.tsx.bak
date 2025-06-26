
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

const TranslationTest: React.FC = () => {
  const { t, language } = useTranslation();
  
  return (
    <div className="p-4 border rounded">
      <h3>Translation Test</h3>
      <p>Current Language: {language}</p>
      <p>Dashboard: {t('dashboard.title')}</p>
      <p>Navigation: {t('navigation.dashboard')}</p>
    </div>
  );
};

export default TranslationTest;
