
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import CategoryHeader from '@/components/categories/CategoryHeader';
import CategoryList from '@/components/categories/CategoryList';
import { useCategories } from '@/hooks/useCategories';
import SidebarLayout from '@/components/layout/SidebarLayout';
import LoadingSection from '@/components/common/LoadingSection';

/**
 * Kateqoriyalar Səhifəsi
 */
const Categories = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { categories, isLoading, error } = useCategories();

  return (
    <>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <CategoryHeader />
          
          {isLoading ? (
            <LoadingSection />
          ) : error ? (
            <div className="border border-red-200 rounded-md p-4 bg-red-50 text-red-500">
              <h3 className="font-semibold">{t('errorLoading')}</h3>
              <p>{t('categoryLoadError')}</p>
            </div>
          ) : (
            <CategoryList 
              categories={categories} 
              userRole={user?.role}
            />
          )}
        </div>
      </SidebarLayout>
    </>
  );
};

export default Categories;
