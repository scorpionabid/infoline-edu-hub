
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import DataEntryHeader from '@/components/dataEntry/DataEntryHeader';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';
import DataEntryDialogs from '@/components/dataEntry/DataEntryDialogs';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { CategoryWithColumns } from '@/types/category';
import { useAuth } from '@/context/AuthContext';
import LoadingSection from '@/components/common/LoadingSection';
import NoDataFound from '@/components/common/NoDataFound';

/**
 * DataEntry Səhifəsi
 * Məlumatların daxil edilməsi və redaktəsi üçün səhifə
 */
const DataEntry = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('categoryId');
  const status = queryParams.get('status');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
  const { categories, isLoading, error } = useCategoryData(user?.schoolId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'submit' | 'approve' | 'reject'>('submit');
  
  useEffect(() => {
    // Qeyd: URLdən seçilən kateqoriya dəyişdikdə state-i yeniləyirik
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
  };
  
  const handleDialogOpen = (type: 'submit' | 'approve' | 'reject') => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.category.id === selectedCategory) 
    : null;

  return (
    <>
      <Helmet>
        <title>{t('dataEntry')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <DataEntryHeader 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            selectedStatus={status}
          />

          {isLoading ? (
            <LoadingSection />
          ) : error ? (
            <div className="border border-red-200 rounded-md p-4 bg-red-50 text-red-500">
              <h3 className="font-semibold">{t('errorLoading')}</h3>
              <p>{t('dataEntryLoadError')}</p>
            </div>
          ) : categories.length === 0 ? (
            <NoDataFound 
              title={t('noCategoriesFound')} 
              description={t('dataEntryNoCategories')} 
            />
          ) : !selectedCategory ? (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">{t('selectCategoryPrompt')}</p>
            </div>
          ) : (
            <DataEntryForm 
              category={selectedCategoryData as CategoryWithColumns} 
              onSubmit={() => handleDialogOpen('submit')}
              onApprove={() => handleDialogOpen('approve')}
              onReject={() => handleDialogOpen('reject')}
            />
          )}
          
          <DataEntryDialogs 
            isOpen={isDialogOpen} 
            type={dialogType}
            onClose={handleDialogClose}
            categoryName={selectedCategoryData?.category.name || ''}
          />
        </div>
      </SidebarLayout>
    </>
  );
};

export default DataEntry;
