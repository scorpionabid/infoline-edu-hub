
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/forms/CategoryCard';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useLanguage } from '@/context/LanguageContext';
import EmptyState from '@/components/common/EmptyState';

export const FormsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { categories, loading, error, refreshCategories } = useCategoryData();
  
  const handleFormClick = (categoryId: string) => {
    navigate(`/forms/${categoryId}`);
  };
  
  const handleCreateForm = () => {
    navigate('/forms/create');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{t('forms')}</h1>
            <p className="text-muted-foreground">{t('formsDescription')}</p>
          </div>
          <Button onClick={handleCreateForm}>
            <Plus className="mr-1 h-4 w-4" /> {t('createForm')}
          </Button>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {!loading && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!loading && !error && categories.length === 0 && (
          <EmptyState
            title={t('noFormsYet')}
            description={t('noFormsDescription')}
            action={{
              label: t('createFirstForm'),
              onClick: handleCreateForm
            }}
            icon={<Plus className="h-6 w-6" />}
            className="h-60"
          />
        )}
        
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleFormClick(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default FormsPage;
