
import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataEntry } from '@/hooks/useDataEntry';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Send, FileSpreadsheet, Upload } from 'lucide-react';
import { 
  getCompletionStatus, 
  getFormattedDeadline 
} from './utils/formUtils';
import DataEntryProgress from './DataEntryProgress';
import { ExcelActions } from './ExcelActions';
import { DataEntryDialogs } from './DataEntryDialogs';
import StatusIndicators from './StatusIndicators';
import { CategoryWithColumns } from '@/types/column';
import FormField from './components/FormField';
import CategoryHeader from './components/CategoryHeader';
import ApprovalAlert from './components/ApprovalAlert';
import RejectionAlert from './components/RejectionAlert';

interface DataEntryFormProps {
  initialCategoryId?: string | null;
  statusFilter?: 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue' | null;
  onDataChanged?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  initialCategoryId,
  statusFilter = null,
  onDataChanged 
}) => {
  const { t } = useLanguage();
  
  // useDataEntry hook-u ilə forma məlumatlarını və funksiyaları alırıq
  const {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData
  } = useDataEntry(initialCategoryId);
  
  // Məlumatlar dəyişdikdə callback funksiyasını çağırırıq
  useEffect(() => {
    if (!isLoading && onDataChanged) {
      onDataChanged();
    }
  }, [formData, isLoading, onDataChanged]);
  
  // Status filtrinə əsasən kategoriyaları filtirləyirik
  const filteredCategories = statusFilter ? categories.filter(category => {
    const categoryEntry = formData.entries.find(entry => entry.categoryId === category.id);
    
    if (!categoryEntry) return false;
    
    switch (statusFilter) {
      case 'pending':
        return categoryEntry.approvalStatus === 'pending';
      case 'approved':
        return categoryEntry.approvalStatus === 'approved';
      case 'rejected':
        return categoryEntry.approvalStatus === 'rejected';
      case 'dueSoon':
        // Son tarixi 3 gün qalmış kategoriyalar
        return category.deadline && new Date(category.deadline).getTime() > Date.now() && 
               new Date(category.deadline).getTime() < Date.now() + (3 * 24 * 60 * 60 * 1000);
      case 'overdue':
        // Son tarixi keçmiş kategoriyalar
        return category.deadline && new Date(category.deadline).getTime() < Date.now();
      default:
        return true;
    }
  }) : categories;
  
  // Yüklənmə vəziyyətində isək
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg font-medium">{t('loading')}</div>
          <p className="text-muted-foreground">{t('loadingDataEntryForm')}</p>
        </div>
      </div>
    );
  }
  
  // Əgər filtirdən sonra heç bir kateqoriya qalmayıbsa
  if (filteredCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="mb-4 p-3 rounded-full bg-muted">
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('noCategoriesFound')}</h3>
        <p className="text-muted-foreground max-w-md">
          {statusFilter 
            ? t('noCategoriesWithSelectedStatus') 
            : t('noCategoriesFoundDesc')}
        </p>
        {statusFilter && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = "/data-entry"}
          >
            {t('clearFilters')}
          </Button>
        )}
      </div>
    );
  }
  
  // Cari kateqoriya və onun daxil etmə məlumatları
  const currentCategory = filteredCategories[currentCategoryIndex];
  const categoryEntry = formData.entries.find(entry => entry.categoryId === currentCategory?.id);
  const isRejected = categoryEntry?.approvalStatus === 'rejected';
  const isApproved = categoryEntry?.approvalStatus === 'approved';
  
  // Formun tamamlanma statusunu alırıq
  const completionStatus = currentCategory ? getCompletionStatus(
    categoryEntry?.completionPercentage || 0,
    isApproved,
    isRejected,
    currentCategory.deadline ? new Date(currentCategory.deadline) : undefined
  ) : null;
  
  // Formun son tarixini formatlanmış şəkildə alırıq
  const formattedDeadline = currentCategory?.deadline 
    ? getFormattedDeadline(new Date(currentCategory.deadline)) 
    : null;
  
  // Sütunları filtirləyirik (aktiv olanları)
  const activeColumns = currentCategory?.columns.filter(col => col.status === 'active') || [];
  
  // Tab dəyişdikdə, kateqoriya dəyişir
  const handleTabChange = (tabValue: string) => {
    const newIndex = filteredCategories.findIndex(cat => cat.id === tabValue);
    if (newIndex !== -1) {
      changeCategory(newIndex);
    }
  };
  
  // Manuel saxlama
  const handleSaveManually = async () => {
    await saveForm();
  };
  
  // Təsdiq üçün göndərmə
  const handleSubmit = async () => {
    await submitForApproval();
  };
  
  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 xl:p-6">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="mb-4 lg:mb-0">
              <DataEntryProgress 
                categories={filteredCategories} 
                formEntries={formData.entries}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <StatusIndicators 
                isAutoSaving={isAutoSaving} 
                lastSaved={formData.lastSaved} 
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveManually}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t('save')}
                </Button>
                <ExcelActions 
                  onDownload={downloadExcelTemplate} 
                  onUpload={uploadExcelData}
                />
                <Button 
                  size="sm" 
                  className="whitespace-nowrap"
                  disabled={isSubmitting || isApproved} 
                  onClick={handleSubmit}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isSubmitting ? t('sending') : t('submitForApprovalBtn')}
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <Tabs defaultValue={currentCategory?.id} value={currentCategory?.id} onValueChange={handleTabChange}>
            <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1">
              {filteredCategories.map((category, index) => {
                const catEntry = formData.entries.find(entry => entry.categoryId === category.id);
                const isCategoryRejected = catEntry?.approvalStatus === 'rejected';
                const isCategoryApproved = catEntry?.approvalStatus === 'approved';
                
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="relative whitespace-nowrap"
                    disabled={isSubmitting}
                  >
                    {category.name}
                    {catEntry && (
                      <Badge 
                        variant="outline" 
                        className={`absolute -top-2 -right-2 ${
                          isCategoryRejected ? 'bg-red-100 text-red-800 border-red-200' :
                          isCategoryApproved ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {catEntry.completionPercentage}%
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {filteredCategories.map((category: CategoryWithColumns) => (
              <TabsContent key={category.id} value={category.id} className="pt-2">
                <CategoryHeader 
                  category={category} 
                  completionStatus={
                    categoryEntry?.categoryId === category.id ? completionStatus : null
                  } 
                  formattedDeadline={
                    category.deadline ? getFormattedDeadline(new Date(category.deadline)) : null
                  }
                />
                
                {/* Təsdiq bildirişi */}
                {categoryEntry?.approvalStatus === 'approved' && (
                  <ApprovalAlert />
                )}
                
                {/* Rədd edilmə bildirişi */}
                {categoryEntry?.approvalStatus === 'rejected' && (
                  <RejectionAlert 
                    reason={categoryEntry.rejectionReason} 
                  />
                )}
                
                {/* Sütunlar üzrə sahələr */}
                <div className="grid gap-4 mt-6">
                  {activeColumns.map((column) => (
                    <FormField
                      key={column.id}
                      column={column}
                      value={categoryEntry?.values.find(v => v.columnId === column.id)?.value}
                      error={getErrorForColumn(column.id)}
                      onChange={(newValue) => updateValue(category.id, column.id, newValue)}
                      readOnly={isApproved || isSubmitting}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      
      <DataEntryDialogs />
    </>
  );
};

export default DataEntryForm;
