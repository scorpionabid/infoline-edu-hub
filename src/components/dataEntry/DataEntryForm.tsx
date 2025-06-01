import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle, CheckCircle, Clock, XCircle, FileEdit, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import DataEntryFormManager from '@/components/dataEntry/core/DataEntryFormManager';
import { useDataEntryManager } from '@/hooks/dataEntry/useDataEntryManager';
import { useStatusUIConfig } from '@/hooks/auth/useStatusPermissions';
import { DataEntryStatus } from '@/types/core/dataEntry';

// DataEntryForm Props
interface DataEntryFormProps {
  schoolId?: string;
  categories?: any[];
  initialCategoryId?: string;
  isSectorAdmin?: boolean;
  schoolName?: string;
}

// Məlumat daxiletmə komponenti - Enhanced with real data manager
const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  schoolId, 
  categories, 
  initialCategoryId, 
  isSectorAdmin = false, 
  schoolName = "" 
}) => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const permissions = usePermissions();
  const [readOnly, setReadOnly] = useState(false);
  const [formStatus, setFormStatus] = useState<'view' | 'edit' | 'locked'>('view');
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  
  // Yükləmə prosesi ilə əlaqəli state-lər
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingCanceled, setLoadingCanceled] = useState(false);
  const [loadRetryCount, setLoadRetryCount] = useState(0);
  
  // Sessiya yoxlama funksiyası
  useEffect(() => {
    // Supabase ilə sessiya yoxlaması - diagnostic məqsədləri üçün
    const checkSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log('Aktiv sessiya tapıldı, ID:', sessionData.session.user.id);
        } else {
          console.log('Aktiv sessiya yoxdur');
        }
      } catch (err) {
        console.error('Sessiya yoxlama xətası:', err);
      }
    };
    
    checkSession();
  }, []);
  
  // ✅ DEĞİŞDİRİLMİŞ: Status-aware permissions using dataManager
  useEffect(() => {
    // Wait for dataManager to be initialized
    if (!dataManager || !dataManager.statusPermissions) {
      setFormStatus('view');
      setReadOnly(true);
      return;
    }
    
    const statusPerms = dataManager.statusPermissions;
    
    // Set form status based on status permissions
    setFormStatus(statusPerms.canEdit ? 'edit' : 'view');
    setReadOnly(statusPerms.readOnly);

    // Enhanced diagnostic logging
    console.group('DataEntry Form - Status-Aware Permissions');
    console.log('Entry Status:', dataManager.entryStatus);
    console.log('Status Permissions:', {
      canEdit: statusPerms.canEdit,
      canSubmit: statusPerms.canSubmit,
      canApprove: statusPerms.canApprove,
      readOnly: statusPerms.readOnly,
      allowedActions: statusPerms.allowedActions
    });
    console.log('Alerts:', statusPerms.alerts);
    console.log('Form State:', {
      formStatus: statusPerms.canEdit ? 'edit' : 'view',
      readOnly: statusPerms.readOnly,
      readOnlyReason: dataManager.readOnlyReason
    });
    console.groupEnd();
  }, [dataManager?.statusPermissions, dataManager?.entryStatus]);
  
  // Safe categories check
  const safeCategories = React.useMemo(() => {
    if (!Array.isArray(categories)) {
      console.warn('DataEntryForm: categories is not an array:', categories);
      return [];
    }
    return categories.filter(cat => cat && cat.id);
  }, [categories]);
  
  // Status UI configuration hook for category display
  const statusUIConfig = useStatusUIConfig(dataManager?.entryStatus);
  
  // Selected category with safety check
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  useEffect(() => {
    if (initialCategoryId && safeCategories.length > 0) {
      const category = safeCategories.find(cat => cat.id === initialCategoryId);
      if (category) {
        setSelectedCategory(category);
      } else if (safeCategories.length > 0) {
        setSelectedCategory(safeCategories[0]);
      }
    } else if (safeCategories.length > 0) {
      setSelectedCategory(safeCategories[0]);
    }
  }, [initialCategoryId, safeCategories]);

  // Data entry manager hook - only initialize when we have valid data
  const shouldInitializeManager = !!selectedCategory && !!selectedCategory.id && !!schoolId;

  // Debug məlumatları
  console.group('DataEntry Component - Initial Values');
  console.log('Selected Category:', selectedCategory);
  console.log('School ID:', schoolId);
  console.log('Should Initialize Manager:', shouldInitializeManager);
  console.groupEnd();
  
  // Məlumat menecerini initializə etmək
  // loadRetryCount değişdikdə təkrar yüklənməsini təmin etmək üçün dependency kimi əlavə edilib
  const dataManager = useDataEntryManager({
    categoryId: shouldInitializeManager ? selectedCategory.id : '',
    schoolId: shouldInitializeManager ? schoolId : '',
    category: selectedCategory
  });
  
  // loadRetryCount dəyişdikdə məcburi yenidən yükləmə
  useEffect(() => {
    if (loadRetryCount > 0 && shouldInitializeManager) {
      console.log(`DataEntryForm: Manual refresh triggered (retry #${loadRetryCount})`);
      dataManager.refreshData(); // Manual refresh
    }
  }, [loadRetryCount, shouldInitializeManager, dataManager]);
  
  // Əlavə debug məlumatları
  console.group('DataEntry Component - After Manager Init');
  console.log('DataManager Loading:', dataManager.isLoading);
  console.log('DataManager Form Data:', dataManager.formData);
  console.log('DataManager Entry Status:', dataManager.entryStatus);
  console.groupEnd();
  
  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory.id) {
      const newParams = new URLSearchParams(location.search);
      newParams.set('categoryId', selectedCategory.id);
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    }
  }, [selectedCategory, location.pathname, location.search, navigate]);
  


  // Uzun çəkən yükləmələr üçün timeout
  useEffect(() => {
    if (dataManager.isLoading && !loadingTimeout) {
      // 10 saniyədən artıq çəkərsə, istifadəçiyə məlumat veririk
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        console.log('DataEntryForm: Loading timeout triggered');
      }, 10000); // 10 saniyə
      
      return () => clearTimeout(timeoutId);
    } else if (!dataManager.isLoading) {
      setLoadingTimeout(false);
    }
  }, [dataManager.isLoading]);
  
  // Məlumatları yenidən yükləmək üçün
  const handleRetryLoading = () => {
    setLoadRetryCount(prev => prev + 1);
    setLoadingTimeout(false);
    setLoadingCanceled(false);
    
    // Manual refresh
    dataManager.refreshData();
  };
  
  // Yükləməni dayandırmaq üçün
  const handleCancelLoading = () => {
    setLoadingCanceled(true);
  };
  
  // Loading state with enhanced handling
  if (dataManager.isLoading && !loadingCanceled) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] space-y-4">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">{t('loading')}</span>
        </div>
        
        {/* Yükləmə uzun çəkdikdə əlavə məlumat və idarəetmə */}
        {loadingTimeout && (
          <div className="max-w-md space-y-3">
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <span className="ml-2">{t('longLoadingTime')}</span>
            </Alert>
            
            <p className="text-sm text-center text-muted-foreground">
              {t('longLoadingDescription')}
            </p>
            
            <div className="flex justify-center gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleCancelLoading}
              >
                {t('cancel')}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryLoading}
              >
                {t('tryAgain')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Xəta işləmə
  if (dataManager.errors && Object.keys(dataManager.errors).length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-2">
            <h3 className="font-medium">{t('dataLoadError')}</h3>
            <p className="text-sm">{dataManager.errors.general || t('unknownError')}</p>
          </div>
        </Alert>
        
        <Button 
          variant="default" 
          onClick={handleRetryLoading}
          className="mt-4"
        >
          {t('tryAgain')}
        </Button>
      </div>
    );
  }
  
  // No categories state
  if (!safeCategories || safeCategories.length === 0) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('noCategories')}</h3>
            <p className="text-sm">{t('noCategoriesDescription')}</p>
          </div>
        </Alert>
      </div>
    );
  }
  
  if (!selectedCategory) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('noCategorySelected')}</h3>
            <p className="text-sm">{t('pleaseSelectCategory')}</p>
          </div>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* School header for sector admin */}
      {isSectorAdmin && schoolName && (
        <div className="md:col-span-4 mb-2">
          <Alert variant="default" className="bg-blue-50">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium">{t('dataEntryForSchool').replace('{school}', schoolName)}</p>
              </div>
            </div>
          </Alert>
        </div>
      )}
      
      {/* Categories list */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div className="space-y-1 p-2">
                {safeCategories.map((category, index) => {
                  const isSelected = selectedCategory?.id === category.id;
                  const statusUIConfig = useStatusUIConfig(dataManager.entryStatus);
                  
                  return (
                    <Button
                      key={category.id || `category-${index}`}
                      variant={isSelected ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        isSelected && "font-medium"
                      )}
                      onClick={() => {
                        setCurrentCategoryIndex(index);
                        setSelectedCategory(category);
                      }}
                    >
                      <span className="flex-1">{category.name || `Category ${index + 1}`}</span>
                      
                      {/* ✅ YENİ: Enhanced status display with proper icons */}
                      {isSelected && dataManager.entryStatus && dataManager.entryStatus !== DataEntryStatus.DRAFT && (
                        <div className="ml-2 flex items-center gap-1">
                          {dataManager.entryStatus === DataEntryStatus.PENDING && <Clock className="w-3 h-3" />}
                          {dataManager.entryStatus === DataEntryStatus.APPROVED && <CheckCircle className="w-3 h-3" />}
                          {dataManager.entryStatus === DataEntryStatus.REJECTED && <XCircle className="w-3 h-3" />}
                          
                          <Badge 
                            variant={statusUIConfig.badge.variant as any} 
                            className="text-xs"
                          >
                            {t(dataManager.entryStatus)}
                          </Badge>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* ✅ YENİ: Status alert display */}
      {dataManager?.statusPermissions?.alerts?.message && (
        <div className="md:col-span-4 mb-4">
          <Alert 
            variant={dataManager.statusPermissions.alerts.type === 'error' ? 'destructive' : 'default'}
            className={cn(
              dataManager.entryStatus === DataEntryStatus.APPROVED && "bg-green-50 border-green-200",
              dataManager.entryStatus === DataEntryStatus.PENDING && "bg-blue-50 border-blue-200",
              dataManager.entryStatus === DataEntryStatus.REJECTED && "bg-red-50 border-red-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dataManager.entryStatus === DataEntryStatus.APPROVED && <CheckCircle className="h-4 w-4 text-green-600" />}
                {dataManager.entryStatus === DataEntryStatus.PENDING && <Clock className="h-4 w-4 text-blue-600" />}
                {dataManager.entryStatus === DataEntryStatus.REJECTED && <XCircle className="h-4 w-4 text-red-600" />}
                {(!dataManager.entryStatus || dataManager.entryStatus === DataEntryStatus.DRAFT) && <FileEdit className="h-4 w-4" />}
                
                <div>
                  <AlertTitle className="text-sm font-medium">
                    {dataManager.statusPermissions.alerts.type === 'success' && t('statusApproved')}
                    {dataManager.statusPermissions.alerts.type === 'info' && t('statusInfo')}
                    {dataManager.statusPermissions.alerts.type === 'warning' && t('statusWarning')}
                    {dataManager.statusPermissions.alerts.type === 'error' && t('statusRejected')}
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {dataManager.statusPermissions.alerts.message}
                  </AlertDescription>
                </div>
              </div>
              
              {/* Status-specific action buttons */}
              {dataManager.statusPermissions.allowedActions.includes('reset') && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => dataManager.handleReset()}
                  disabled={dataManager.isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {t('resetToDraft')}
                </Button>
              )}
            </div>
          </Alert>
        </div>
      )}
      
      {/* Data entry form with manager */}
      <div className="md:col-span-3">
        <DataEntryFormManager
          category={selectedCategory}
          schoolId={schoolId || ''}
          formData={dataManager.formData}
          onFormDataChange={dataManager.setFormData}
          onSave={dataManager.handleSave}
          onSubmit={dataManager.handleSubmit}
          onExportTemplate={dataManager.handleExportTemplate}
          onImportData={dataManager.handleImportData}
          onRefresh={dataManager.refreshData}
          isLoading={dataManager.isLoading || dataManager.isRefreshing}
          isSaving={dataManager.isSaving}
          isSubmitting={dataManager.isSubmitting}
          errors={dataManager.errors}
          readOnly={dataManager.readOnly}
          // ✅ YENİ: Status-related props
          entryStatus={dataManager.entryStatus}
          statusPermissions={dataManager.statusPermissions}
          onStatusTransition={dataManager.handleStatusTransition}
          onApprove={dataManager.handleApprove}
          onReject={dataManager.handleReject}
          onReset={dataManager.handleReset}
        />
      </div>
    </div>
  );
};

export default DataEntryForm;
