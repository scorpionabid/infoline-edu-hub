
import React, { useEffect, useState } from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataEntry } from '@/hooks/useDataEntry';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Send, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DataEntryProgress from './DataEntryProgress';
import ExcelActions from './ExcelActions';
import DataEntryDialogs from './DataEntryDialogs';
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
  const { t } = useLanguageSafe();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  
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
  
  useEffect(() => {
    if (!isLoading && onDataChanged) {
      onDataChanged();
    }
  }, [formData, isLoading, onDataChanged]);
  
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
        return category.deadline && new Date(category.deadline).getTime() > Date.now() && 
               new Date(category.deadline).getTime() < Date.now() + (3 * 24 * 60 * 60 * 1000);
      case 'overdue':
        return category.deadline && new Date(category.deadline).getTime() < Date.now();
      default:
        return true;
    }
  }) : categories;
  
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
  
  const currentCategory = filteredCategories[currentCategoryIndex];
  const categoryEntry = formData.entries.find(entry => entry.categoryId === currentCategory?.id);
  const isRejected = categoryEntry?.approvalStatus === 'rejected';
  const isApproved = categoryEntry?.approvalStatus === 'approved';
  
  const activeColumns = currentCategory?.columns?.filter(col => col.status === 'active') || [];
  
  const handleTabChange = (tabValue: string) => {
    const newIndex = filteredCategories.findIndex(cat => cat.id === tabValue);
    if (newIndex !== -1) {
      changeCategory(newIndex);
    }
  };
  
  const handleSaveManually = async () => {
    await saveForm();
  };
  
  const handleSubmitClick = () => {
    setIsSubmitDialogOpen(true);
  };
  
  const formattedLastSaved = formData.lastSaved 
    ? new Date(formData.lastSaved).toLocaleTimeString() 
    : '';
  
  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 xl:p-6">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="mb-4 lg:mb-0">
              <DataEntryProgress 
                total={filteredCategories.length} 
                completed={formData.entries.filter(e => e.isCompleted).length}
                percentage={formData.overallProgress}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <StatusIndicators 
                status={isAutoSaving ? "saving" : "saved"} 
                timestamp={formattedLastSaved} 
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
                  onClick={handleSubmitClick}
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
                  name={category.name}
                  description={category.description || ''}
                  deadline={category.deadline}
                  isSubmitted={categoryEntry?.isSubmitted || false}
                />
                
                {categoryEntry?.approvalStatus === 'approved' && (
                  <ApprovalAlert isApproved={true} />
                )}
                
                {categoryEntry?.approvalStatus === 'rejected' && (
                  <RejectionAlert errorMessage={categoryEntry.rejectionReason} />
                )}
                
                <div className="grid gap-4 mt-6">
                  {activeColumns.map((column) => (
                    <FormField
                      key={column.id}
                      id={column.id}
                      label={column.name}
                      type={column.type}
                      required={column.isRequired}
                      options={column.options}
                      placeholder={column.placeholder}
                      helpText={column.helpText || column.description}
                      value={categoryEntry?.values.find(v => v.columnId === column.id)?.value || ''}
                      error={getErrorForColumn(column.id)}
                      onChange={(newValue) => updateValue(category.id, column.id, newValue)}
                      disabled={isApproved || isSubmitting}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      
      <DataEntryDialogs 
        isSubmitDialogOpen={isSubmitDialogOpen}
        setIsSubmitDialogOpen={setIsSubmitDialogOpen}
        isHelpDialogOpen={isHelpDialogOpen}
        setIsHelpDialogOpen={setIsHelpDialogOpen}
        submitForApproval={submitForApproval}
      />
    </>
  );
};

export default DataEntryForm;
