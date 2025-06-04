
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';

const Performance: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('performance')} | InfoLine</title>
      </Helmet>

      <PerformanceDashboard />
    </>
  );
};

export default Performance;
