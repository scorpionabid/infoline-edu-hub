
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import SectorsContainer from '@/components/sectors/SectorsContainer';
import { useSectors } from '@/hooks/sectors/useSectors';

const Sectors = () => {
  const { t } = useLanguage();
  const { data: sectors = [], isLoading, refetch } = useSectors();

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <>
      <Helmet>
        <title>{t('sectors')} | InfoLine</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 py-8">
          <SectorsContainer
            sectors={sectors}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </>
  );
};

export default Sectors;
