
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useDataEntry } from '@/hooks/useDataEntry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';
import DataEntryProgress from '@/components/dataEntry/DataEntryProgress';
import ExcelActions from '@/components/dataEntry/ExcelActions';
import StatusIndicators from '@/components/dataEntry/StatusIndicators';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { DataEntryDialogs } from '@/components/dataEntry/DataEntryDialogs';

const DataEntry: React.FC = () => {
  const { t } = useLanguage();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('entry');
  
  const { categories, isLoading: categoriesLoading } = useCategories();
  const {
    category,
    columns,
    status,
    completionPercentage,
    saveStatus,
    handleSave,
    handleApprove,
    showRejectionDialog,
    handleSubmit,
    canSubmit,
    errorMessage,
    successMessage,
    isSubmitting,
    dialogsState,
    closeDialogs,
    handleDialogConfirm,
  } = useDataEntry(categoryId);
  
  // Əgər kateqoriya yoxdursa və yükləmə bitibsə, kateqoriyalar səhifəsinə yönləndir
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && !category) {
      navigate('/categories');
    }
  }, [category, categories, categoriesLoading, navigate]);
  
  const getHeaderAction = () => {
    if (status === 'approved') {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-500 font-medium">{t('approved')}</span>
        </div>
      );
    }
    
    if (status === 'rejected') {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-500 font-medium">{t('rejected')}</span>
        </div>
      );
    }
    
    return (
      <>
        <Button 
          variant="outline" 
          onClick={handleSave} 
          disabled={isSubmitting || saveStatus === 'saving'}
        >
          <Save className="h-4 w-4 mr-2" />
          {saveStatus === 'saving' ? t('saving') : t('save')}
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!canSubmit || isSubmitting}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </>
    );
  };
  
  if (categoriesLoading || !category) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-t-primary rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">{t('loading')}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }
  
  return (
    <SidebarLayout>
      <div className="pb-6">
        <PageHeader
          title={category?.name || t('dataEntry')}
          description={category?.description || t('dataEntryDescription')}
        >
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/categories')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('back')}
            </Button>
            {getHeaderAction()}
          </div>
        </PageHeader>
        
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <StatusIndicators 
                status={status}
                completionPercentage={completionPercentage}
              />
              <ExcelActions categoryId={category.id} />
            </div>
            
            <div className="bg-card rounded-lg border shadow-sm">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full border-b rounded-none px-6">
                  <TabsTrigger value="entry">{t('dataEntry')}</TabsTrigger>
                  <TabsTrigger value="progress">{t('progress')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="entry" className="p-6">
                  <DataEntryForm 
                    columns={columns}
                    category={category as Category}
                    status={status}
                  />
                </TabsContent>
                
                <TabsContent value="progress" className="p-6">
                  <DataEntryProgress 
                    columns={columns}
                    completionPercentage={completionPercentage}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="md:w-1/3">
            {/* Burada kateqoriya haqqında əlavə məlumatlar və köməkçi elementlər ola bilər */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="font-medium text-lg mb-3">{t('aboutCategory')}</h3>
              <p className="text-muted-foreground">{category.description}</p>
              
              {/* Kateqoriya məlumatları */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('columns')}</span>
                  <span className="text-sm font-medium">{columns.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('completionRate')}</span>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('status')}</span>
                  <span className="text-sm font-medium">
                    {t(status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dialoglar: Təsdiq, Rədd etmə, Xəbərdarlıq və s. */}
        <DataEntryDialogs 
          state={dialogsState}
          onClose={closeDialogs}
          onConfirm={handleDialogConfirm}
        />
      </div>
    </SidebarLayout>
  );
};

export default DataEntry;
