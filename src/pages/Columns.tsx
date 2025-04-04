
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { useColumns } from '@/hooks/useColumns';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ColumnHeader from '@/components/columns/ColumnHeader';
import ColumnList from '@/components/columns/ColumnList';
import LoadingSection from '@/components/common/LoadingSection';
import NoDataFound from '@/components/common/NoDataFound';

/**
 * Kateqoriya Sütunları Səhifəsi
 * Seçilən kateqoriyaya aid olan sütunları göstərir.
 */
const Columns = () => {
  const { t } = useLanguage();
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  const { categories } = useCategories();
  const { columns, isLoading, error, fetchColumns } = useColumns();

  useEffect(() => {
    if (categoryId) {
      fetchColumns(categoryId);
    }
  }, [categoryId]);

  const category = categories.find(c => c.id === categoryId);

  return (
    <>
      <Helmet>
        <title>{category?.name ? `${category.name} ${t('columns')}` : t('columns')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <ColumnHeader categoryId={categoryId} categoryName={category?.name || ''} />

          {isLoading ? (
            <LoadingSection />
          ) : error ? (
            <div className="border border-red-200 rounded-md p-4 bg-red-50 text-red-500">
              <h3 className="font-semibold">{t('errorLoading')}</h3>
              <p>{t('columnsLoadError')}</p>
            </div>
          ) : columns.length === 0 ? (
            <NoDataFound 
              title={t('noColumnsFound')} 
              description={t('noColumnsDescription')}
              actionText={t('createColumn')}
              actionPath="#" 
            />
          ) : (
            <ColumnList columns={columns} />
          )}
        </div>
      </SidebarLayout>
    </>
  );
};

export default Columns;
