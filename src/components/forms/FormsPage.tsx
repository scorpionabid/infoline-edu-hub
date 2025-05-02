
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { useCategories } from '@/hooks/categories/useCategories';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { DataEntryStatus } from '@/types/dataEntry';
import { CategoryCard } from '@/components/forms/CategoryCard';

export const FormsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { categories, isLoading, error } = useCategories();
  const { schoolId } = usePermissions();
  const [activeTab, setActiveTab] = useState<DataEntryStatus | 'all'>('all');
  
  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    if (activeTab === 'all') return categories;
    
    return categories.filter(category => {
      // Status filterlərini tətbiq et
      if (activeTab === 'pending' && category.status === 'pending') return true;
      if (activeTab === 'approved' && category.status === 'approved') return true;
      if (activeTab === 'rejected' && category.status === 'rejected') return true;
      if (activeTab === 'draft' && category.status === 'draft') return true;
      return false;
    });
  }, [categories, activeTab]);

  const handleStartForm = (categoryId: string) => {
    navigate(`/data-entry/${categoryId}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading={t('forms')}
        subheading={t('formsDescription')}
      />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as DataEntryStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="all">{t('allForms')}</TabsTrigger>
          <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
          <TabsTrigger value="approved">{t('approvedForms')}</TabsTrigger>
          <TabsTrigger value="rejected">{t('rejectedForms')}</TabsTrigger>
          <TabsTrigger value="draft">{t('draftForms')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="col-span-full p-4 text-center text-red-500">
                {t('errorLoadingCategories')}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="col-span-full p-8 text-center text-muted-foreground">
                {t('noFormsFound')}
              </div>
            ) : (
              filteredCategories.map(category => (
                <CategoryCard 
                  key={category.id}
                  category={category}
                  onStart={() => handleStartForm(category.id)}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pendingForms')}</CardTitle>
              <CardDescription>{t('pendingFormsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    {t('noPendingForms')}
                  </div>
                ) : (
                  filteredCategories.map(category => (
                    <CategoryCard 
                      key={category.id}
                      category={category}
                      onStart={() => handleStartForm(category.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('approvedForms')}</CardTitle>
              <CardDescription>{t('approvedFormsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    {t('noApprovedForms')}
                  </div>
                ) : (
                  filteredCategories.map(category => (
                    <CategoryCard 
                      key={category.id}
                      category={category}
                      onStart={() => handleStartForm(category.id)}
                      readOnly={true}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('rejectedForms')}</CardTitle>
              <CardDescription>{t('rejectedFormsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    {t('noRejectedForms')}
                  </div>
                ) : (
                  filteredCategories.map(category => (
                    <CategoryCard 
                      key={category.id}
                      category={category}
                      onStart={() => handleStartForm(category.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('draftForms')}</CardTitle>
              <CardDescription>{t('draftFormsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    {t('noDraftForms')}
                  </div>
                ) : (
                  filteredCategories.map(category => (
                    <CategoryCard 
                      key={category.id}
                      category={category}
                      onStart={() => handleStartForm(category.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
