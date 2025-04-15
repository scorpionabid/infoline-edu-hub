import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { useDataEntry } from '@/hooks/useDataEntry';
import CategoryForm from './CategoryForm';
import CategoryConfirmationDialog from './CategoryConfirmationDialog';
import { DataEntrySaveStatus } from '@/types/dataEntry';
import { ArrowLeft, CheckCircle, Loader2, Save } from 'lucide-react';

const DataEntryForm: React.FC = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get initialCategoryId from URL query params if available
  const urlParams = new URLSearchParams(window.location.search);
  const categoryIdFromUrl = urlParams.get('categoryId');
  
  const {
    categories,
    entries,
    isLoading,
    isSubmitting,
    saveStatus,
    handleSave,
    handleSubmitForApproval,
    handleEntriesChange,
    isDataModified,
    loadDataForSchool,
  } = useDataEntry({
    schoolId: schoolId || '',
  });

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      // Use categoryId from URL if available and valid
      if (categoryIdFromUrl) {
        const exists = categories.some(cat => cat.id === categoryIdFromUrl);
        if (exists) {
          setActiveCategory(categoryIdFromUrl);
          return;
        }
      }
      
      // Otherwise use the first category
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory, categoryIdFromUrl]);

  const handleTabChange = (value: string) => {
    if (isDataModified) {
      // If data is modified, show confirmation dialog
      setShowConfirmation(true);
      return;
    }
    
    setActiveCategory(value);
  };

  const confirmTabChange = (value: string) => {
    setActiveCategory(value);
    setShowConfirmation(false);
  };

  // Display the status message
  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case DataEntrySaveStatus.SAVED:
        return t('dataSaved');
      case DataEntrySaveStatus.SUBMITTED:
        return t('dataSubmittedForApproval');
      case DataEntrySaveStatus.ERROR:
        return t('errorSavingData');
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dataEntry')}</h1>
          <p className="text-muted-foreground">{t('dataEntryDescription')}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          
          {isSubmitting ? (
            <Button disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('saving')}
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              disabled={!isDataModified}
            >
              <Save className="w-4 h-4 mr-2" />
              {t('save')}
            </Button>
          )}
          
          <Button 
            variant="default" 
            onClick={handleSubmitForApproval}
            disabled={isSubmitting}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {t('submitForApproval')}
          </Button>
        </div>
      </div>
      
      {saveStatus !== DataEntrySaveStatus.NONE && (
        <div className={`p-4 rounded-md ${saveStatus === DataEntrySaveStatus.ERROR ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {getSaveStatusMessage()}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
          <CardDescription>{t('categoriesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {t('noCategoriesAvailable')}
            </div>
          ) : (
            <Tabs 
              value={activeCategory || categories[0].id} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="whitespace-nowrap"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <CategoryForm 
                    category={category}
                    entries={entries}
                    onEntriesChange={handleEntriesChange}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      <CategoryConfirmationDialog 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => activeCategory && confirmTabChange(activeCategory)}
      />
    </div>
  );
};

export default DataEntryForm;
