
import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';

const Performance: React.FC = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = 'Performans | InfoLine';
  }, []);

  return (
    <PerformanceDashboard />
  );
};

export default Performance;
