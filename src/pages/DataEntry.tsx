
import React, { useState, useEffect, useMemo } from 'react';
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
import DataEntryDialogs from '@/components/dataEntry/DataEntryDialogs';

const DataEntry: React.FC = () => {
  const { t } = useLanguage();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('entry');
  
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [dialogState, setDialogState] = useState({
    isSubmitDialogOpen: false,
    isHelpDialogOpen: false,
    isRejectionDialogOpen: false,
    isApprovalDialogOpen: false
  });
  
  const {
    categories: dataEntryCategories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    saveForm,
    submitForApproval,
    downloadExcelTemplate,
    uploadExcelData
  } = useDataEntry(categoryId);
  
  // Aktiv kateqoriyanı hesablayırıq
  const currentCategory = useMemo(() => {
    if (dataEntryCategories && dataEntryCategories.length > 0) {
      return dataEntryCategories[currentCategoryIndex];
    }
    return null;
  }, [dataEntryCategories, currentCategoryIndex]);
  
  // Kateqoriya statusu və tamamlama faizini hesablayırıq
  const status = useMemo(() => {
    if (!currentCategory) return 'pending';
    const entry = formData.entries.find(e => e.categoryId === currentCategory.id);
    return entry?.approvalStatus || 'pending';
  }, [currentCategory, formData.entries]);
  
  const completionPercentage = useMemo(() => {
    if (!currentCategory) return 0;
    const entry = formData.entries.find(e => e.categoryId === currentCategory.id);
    return entry?.completionPercentage || 0;
  }, [currentCategory, formData.entries]);
  
  // Göstərilən kateqoriyanın sütunları
  const columns = useMemo(() => {
    return currentCategory?.columns || [];
  }, [currentCategory]);
  
  // Dəyişiklikləri saxlama
  const handleSave = () => {
    saveForm();
  };
  
  // Təsdiq üçün göndərmə dialoqu
  const handleSubmitClick = () => {
    setDialogState(prev => ({...prev, isSubmitDialogOpen: true}));
  };
  
  // Rədd etmə dialoqu
  const showRejectionDialog = () => {
    setDialogState(prev => ({...prev, isRejectionDialogOpen: true}));
  };
  
  // Təsdiq dialoqu
  const handleApprove = () => {
    setDialogState(prev => ({...prev, isApprovalDialogOpen: true}));
  };
  
  // Dialogların bağlanması
  const closeDialogs = () => {
    setDialogState({
      isSubmitDialogOpen: false,
      isHelpDialogOpen: false,
      isRejectionDialogOpen: false,
      isApprovalDialogOpen: false
    });
  };
  
  // Dialog təsdiqi
  const handleDialogConfirm = (type: string) => {
    if (type === 'submit') {
      submitForApproval();
    }
    closeDialogs();
  };
  
  // Əgər kateqoriya yoxdursa və yükləmə bitibsə, kateqoriyalar səhifəsinə yönləndir
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && !currentCategory) {
      navigate('/categories');
    }
  }, [currentCategory, categories, categoriesLoading, navigate]);
  
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
          disabled={isSubmitting || isAutoSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isAutoSaving ? t('saving') : t('save')}
        </Button>
        
        <Button 
          onClick={handleSubmitClick} 
          disabled={completionPercentage < 100 || isSubmitting}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </>
    );
  };
  
  if (categoriesLoading || !currentCategory) {
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
          title={currentCategory?.name || t('dataEntry')}
          description={currentCategory?.description || t('dataEntryDescription')}
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
                errors={errors}
              />
              <ExcelActions 
                onDownloadTemplate={() => downloadExcelTemplate(currentCategory.id)}
                onUploadData={(file) => uploadExcelData(file, currentCategory.id)}
              />
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
                    initialCategoryId={categoryId}
                    statusFilter={status}
                    onDataChanged={handleSave}
                  />
                </TabsContent>
                
                <TabsContent value="progress" className="p-6">
                  <DataEntryProgress 
                    percentage={completionPercentage}
                    total={columns.length}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="md:w-1/3">
            {/* Burada kateqoriya haqqında əlavə məlumatlar və köməkçi elementlər ola bilər */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="font-medium text-lg mb-3">{t('aboutCategory')}</h3>
              <p className="text-muted-foreground">{currentCategory.description}</p>
              
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
          state={dialogState}
          onClose={closeDialogs}
          onConfirm={handleDialogConfirm}
        />
      </div>
    </SidebarLayout>
  );
};

export default DataEntry;
