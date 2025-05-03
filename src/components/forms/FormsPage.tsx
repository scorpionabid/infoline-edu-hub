import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, ArrowRight, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryCard } from './CategoryCard';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { DataEntryStatus } from '@/types/dataEntry';
import { Alert, AlertCircle, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const FormsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { categories, isLoading, error } = useCategoryData();
  const { isSchoolAdmin, isSectorAdmin } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Kateqoriyaları filtrələmək
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && (
      (activeTab === 'pending' && String(category.status) === 'pending') ||
      (activeTab === 'approved' && String(category.status) === 'approved') ||
      (activeTab === 'rejected' && String(category.status) === 'rejected') ||
      (activeTab === 'draft' && String(category.status) === 'draft')
    );
  });

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/forms/${categoryId}`);
  };

  if (categories.loading) {
    return (
      <div className="py-6 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <p className="text-red-700">{t('errorLoadingCategories')}</p>
          </div>
          <p className="text-sm text-red-600 mt-2">{error.message}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  if (categories.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Xəta</AlertTitle>
        <AlertDescription>
          {categories.error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('forms')}</h1>
          <p className="text-muted-foreground mt-1">
            {isSchoolAdmin ? t('formDescriptionSchool') : t('formDescriptionSector')}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchCategories')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="md:w-auto w-full">
            <Filter className="h-4 w-4 mr-2" />
            {t('filterForms')}
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
            <TabsTrigger value="all">{t('allForms')}</TabsTrigger>
            <TabsTrigger value="draft">{t('draftForms')}</TabsTrigger>
            <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
            <TabsTrigger value="approved">{t('approvedForms')}</TabsTrigger>
            <TabsTrigger value="rejected">{t('rejectedForms')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {renderCategoryGrid(filteredCategories, isLoading, handleCategoryClick, t)}
          </TabsContent>
          
          <TabsContent value="draft" className="mt-0">
            {renderCategoryGrid(filteredCategories, isLoading, handleCategoryClick, t)}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {renderCategoryGrid(filteredCategories, isLoading, handleCategoryClick, t)}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            {renderCategoryGrid(filteredCategories, isLoading, handleCategoryClick, t)}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            {renderCategoryGrid(filteredCategories, isLoading, handleCategoryClick, t)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function renderCategoryGrid(categories: any[], isLoading: boolean, onClick: (id: string) => void, t: any) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-5">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!categories.length) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Heç bir forma tapılmadı</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Seçdiyiniz filtrlərə uyğun heç bir forma yoxdur. Filterləri dəyişin və ya bütün formları göstərin.
        </p>
        <Button variant="outline">Bütün formaları göstər</Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map(category => (
        <CategoryCard 
          key={category.id} 
          category={category}
          onClick={() => onClick(category.id)} 
        />
      ))}
    </div>
  );
}

export default FormsPage;
