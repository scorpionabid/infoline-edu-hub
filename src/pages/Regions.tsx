import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Region } from '@/types/region';
import { ensureRegionStatus } from '@/utils/buildFixes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Pagination from '@/components/ui/pagination';

const Regions = () => {
  const { t } = useLanguageSafe();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: countError, count } = await supabase
        .from('regions')
        .select('*', { count: 'exact' });

      if (countError) throw countError;
      setTotalCount(count || 0);

      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*')
        .eq('status', 'active')
        .order('name')
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (regionsError) throw regionsError;

      const typedRegions = (regionsData || []).map(region => ({
        ...region,
        status: ensureRegionStatus(region.status) as 'active' | 'inactive'
      }));

      setRegions(typedRegions);
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorFetchingRegions'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Helmet>
        <title>{t('regions')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">{t('regions')}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((region) => (
              <div key={region.id} className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold">{region.name}</h2>
                <p className="text-gray-600">{region.description}</p>
                <p className="text-sm text-gray-500">
                  {t('status')}: {region.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && regions.length > 0 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / pageSize)}
              onPageChange={setCurrentPage}
              previousLabel={t('previous')}
              nextLabel={t('next')}
              pageLabel={(page) => `${t('page')} ${page}`}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Regions;
