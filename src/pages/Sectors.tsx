
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useSectors } from '@/hooks/sectors/useSectors';
import SectorsContainer from '@/components/sectors/SectorsContainer';
import { Loader2 } from 'lucide-react';

const Sectors = () => {
  const { t } = useLanguageSafe();
  const { sectors, loading, refetch } = useSectors();

  return (
    <>
      <Helmet>
        <title>{t('sectors')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <SectorsContainer
            sectors={sectors}
            isLoading={loading}
            onRefresh={refetch}
          />
        )}
      </div>
    </>
  );
};

export default Sectors;
