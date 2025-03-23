
import React, { useEffect } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/context/LanguageContext';
import FormField from './components/FormField';
import ApprovalAlert from './components/ApprovalAlert';
import CategoryHeader from './components/CategoryHeader';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import StatusBadge from './components/StatusBadge';

interface DataEntryFormProps {
  category: CategoryWithColumns;
  entryData: CategoryEntryData;
  onValueChange: (categoryId: string, columnId: string, value: any) => void;
  getErrorForColumn: (columnId: string) => string | undefined;
  isSubmitted: boolean;
  onSubmitCategory?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  entryData,
  onValueChange,
  getErrorForColumn,
  isSubmitted,
  onSubmitCategory
}) => {
  const form = useForm();
  const { t } = useLanguage();

  // Kateqoriya dəyişdikdə scroll-u yuxarı qaldıraq
  useEffect(() => {
    const formContainer = document.querySelector('.space-y-4');
    if (formContainer) {
      formContainer.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    
    // Konsola məlumatları çıxaraq - debug üçün
    console.log(`Cari kateqoriya: ${category.name}, ID: ${category.id}`);
    console.log(`Cari kateqoriya dəyərləri:`, entryData.values);
    console.log(`Cari kateqoriya sütunları:`, category.columns);
  }, [category.id, entryData]);

  // Tamamlanma faizini hesablayaq
  const completionPercentage = entryData.completionPercentage || 0;
  const isCompleted = entryData.isCompleted || false;

  return (
    <div className="space-y-6">
      <CategoryHeader 
        name={category.name}
        description={category.description}
        deadline={category.deadline}
        isSubmitted={isSubmitted}
      />
      
      {category.description && (
        <div className="text-sm text-muted-foreground mb-6 bg-muted/50 p-3 rounded-md">
          {category.description}
        </div>
      )}

      {entryData.approvalStatus === 'rejected' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('categoryRejected')}</AlertTitle>
          <AlertDescription>
            {t('fixErrorsAndResubmit')}
          </AlertDescription>
        </Alert>
      )}
      
      <ApprovalAlert isApproved={entryData.approvalStatus === 'approved'} />
      
      {/* Tamamlanma faizini göstərən indikator */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{Math.round(completionPercentage)}%</span> {t('tamamlandı')}
          {entryData.approvalStatus && 
            <StatusBadge status={entryData.approvalStatus} />
          }
        </div>
        
        {/* Təsdiq üçün göndər düyməsi - yalnız form səviyyəsində göstərilir, aşağıda göstərilmir */}
        {onSubmitCategory && !isSubmitted && !entryData.isSubmitted && (
          <Button 
            onClick={onSubmitCategory} 
            disabled={!isCompleted || entryData.approvalStatus === 'approved'}
            className="ml-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {t('submitForApproval')}
          </Button>
        )}
        
        {/* Yenidən göndər düyməsi - əgər artıq göndərilibsə, amma təsdiqlənməyibsə */}
        {onSubmitCategory && !isSubmitted && entryData.isSubmitted && entryData.approvalStatus !== 'approved' && (
          <Button 
            onClick={onSubmitCategory} 
            disabled={!isCompleted}
            className="ml-auto"
            variant="outline"
          >
            <Send className="h-4 w-4 mr-2" />
            {t('resubmit')}
          </Button>
        )}
      </div>
      
      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {category.columns.map(column => (
              <FormField
                key={column.id}
                column={column}
                categoryId={category.id}
                values={entryData.values}
                onValueChange={onValueChange}
                getErrorForColumn={getErrorForColumn}
                isDisabled={isSubmitted}
              />
            ))}
          </div>
        </form>
      </Form>
      
      {/* Aşağıdakı submit düyməsi - yalnız scroll uzun olduqda və isSubmitted=false olduqda görünəcək */}
      {onSubmitCategory && !isSubmitted && (
        <div className="sticky bottom-4 flex justify-end py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button 
            onClick={onSubmitCategory}
            disabled={!isCompleted || entryData.approvalStatus === 'approved'}
          >
            <Send className="h-4 w-4 mr-2" />
            {entryData.isSubmitted ? t('resubmit') : t('submitForApproval')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataEntryForm;
