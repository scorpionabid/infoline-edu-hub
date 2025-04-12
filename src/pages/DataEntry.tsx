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
import { ChevronLeft, Save, CheckCircle, AlertCircle, Upload, FileDown } from 'lucide-react';
import DataEntryDialogs from '@/components/dataEntry/DataEntryDialogs';
import { ColumnValidationError } from '@/types/dataEntry';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

const DataEntry: React.FC = () => {
  const { t } = useLanguage();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('entry');
  const { user } = useAuth();
  const { userRole } = usePermissions();
  
  const isSchoolAdmin = userRole === 'schooladmin';
  const canEditData = useMemo(() => {
    return isSchoolAdmin && ['pending', 'rejected'].includes(status);
  }, [isSchoolAdmin, status]);
  
  useEffect(() => {
    if (userRole === 'regionadmin') {
      navigate('/categories');
    }
  }, [userRole, navigate]);
  
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
  
  const currentCategory = useMemo(() => {
    if (dataEntryCategories && dataEntryCategories.length > 0) {
      return dataEntryCategories[currentCategoryIndex];
    }
    return null;
  }, [dataEntryCategories, currentCategoryIndex]);
  
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
  
  const columns = useMemo(() => {
    return currentCategory?.columns || [];
  }, [currentCategory]);
  
  const handleSave = () => {
    saveForm();
  };
  
  const handleSubmitClick = () => {
    setDialogState(prev => ({...prev, isSubmitDialogOpen: true}));
  };
  
  const showRejectionDialog = () => {
    setDialogState(prev => ({...prev, isRejectionDialogOpen: true}));
  };
  
  const handleApprove = () => {
    setDialogState(prev => ({...prev, isApprovalDialogOpen: true}));
  };
  
  const closeDialogs = () => {
    setDialogState({
      isSubmitDialogOpen: false,
      isHelpDialogOpen: false,
      isRejectionDialogOpen: false,
      isApprovalDialogOpen: false
    });
  };
  
  const handleDialogConfirm = (type: string) => {
    if (type === 'submit') {
      submitForApproval();
    }
    closeDialogs();
  };
  
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && !currentCategory) {
      navigate('/categories');
    }
  }, [currentCategory, categories, categoriesLoading, navigate]);
  
  if (userRole === 'regionadmin') {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('accessDenied')}</h2>
            <p className="text-muted-foreground mb-6">{t('regionAdminNoDataEntry')}</p>
            <Button onClick={() => navigate('/categories')}>
              {t('goToCategories')}
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }
  
  const getHeaderAction = () => {
    if (!canEditData) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{t('viewOnlyMode')}</span>
        </div>
      );
    }
    
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
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
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
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadExcelTemplate(currentCategory.id)}
                  disabled={!canEditData}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  {t('excelTemplate')}
                </Button>
                
                {canEditData && (
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {t('uploadExcel')}
                    </Button>
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          uploadExcelData(e.target.files[0], currentCategory.id);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
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
                    readOnly={!canEditData}
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
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="font-medium text-lg mb-3">{t('aboutCategory')}</h3>
              <p className="text-muted-foreground">{currentCategory.description}</p>
              
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
                {!isSchoolAdmin && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {t('nonSchoolAdminView')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
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
