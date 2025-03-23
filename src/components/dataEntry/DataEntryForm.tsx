
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

interface DataEntryFormProps {
  category: CategoryWithColumns;
  entryData: CategoryEntryData;
  onValueChange: (categoryId: string, columnId: string, value: any) => void;
  getErrorForColumn: (columnId: string) => string | undefined;
  isSubmitted: boolean;
  onSaveCategory?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  entryData,
  onValueChange,
  getErrorForColumn,
  isSubmitted,
  onSaveCategory
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
  }, [category.id]);

  return (
    <div className="space-y-6">
      <CategoryHeader 
        name={category.name}
        description={category.description}
        deadline={category.deadline}
        onSaveCategory={onSaveCategory}
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
      
      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export default DataEntryForm;
