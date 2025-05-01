
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { CategoryForm } from './CategoryForm';
import {
  Column,
  CategoryWithColumns,
  ColumnValidationError
} from '@/types/column';
import {
  DataEntryForm,
  EntryValue,
  DataEntrySaveStatus,
  DataEntryStatus
} from '@/types/dataEntry';
import {
  getDataEntries,
  saveDataEntryForm,
  submitForApproval
} from '@/services/dataEntryService';
import { useCategories } from '@/hooks/useCategories';
import { useSchool } from '@/hooks/useSchool';
import { CategoryConfirmationDialog } from './CategoryConfirmationDialog';
import { validateEntryValue } from './utils/formUtils';

const DataEntryFormComponent: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formValues, setFormValues] = useState<EntryValue[]>([]);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, ColumnValidationError | undefined>>({});

  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useCategories();
  const { school, isLoading: isLoadingSchool, error: schoolError } = useSchool();

  const category = React.useMemo(() => {
    if (!categoryId || !categories) return null;
    return categories.find(cat => cat.id === categoryId) || null;
  }, [categoryId, categories]);

  const categoryWithColumns = React.useMemo(() => {
    if (!category) return null;
    return category as CategoryWithColumns;
  }, [category]);

  useEffect(() => {
    if (categoryWithColumns && school) {
      fetchInitialValues(school.id, categoryWithColumns);
    }
  }, [categoryWithColumns, school]);

  const fetchInitialValues = useCallback(
    async (schoolId: string, category: CategoryWithColumns) => {
      if (!schoolId || !category) return;

      const { success, data, error } = await getDataEntries(schoolId, category.id);

      if (success && data) {
        const initialValues = category.columns.map(column => {
          const entry = data.find(item => item.columnId === column.id);
          return {
            name: column.name,
            columnId: column.id,
            value: entry?.value || column.default_value || '',
            isValid: true,
            status: entry?.status,
            entryId: entry?.id
          };
        });
        setFormValues(initialValues);
      } else if (error) {
        toast.error(t('error'), {
          description: t('errorFetchingDataEntries')
        });
      }
    },
    [t]
  );

  const handleValueChange = (columnId: string, value: string) => {
    setIsDirty(true);
    setFormValues(prevValues => {
      const updatedValues = prevValues.map(val =>
        val.columnId === columnId ? { ...val, value } : val
      );
      return updatedValues;
    });
  };

  const validateEntries = (entries: EntryValue[], columns: Column[]): EntryValue[] => {
    return entries.map(entry => {
      const column = columns.find(col => col.id === entry.columnId);
      if (!column) return entry;
      
      const error = validateEntryValue(entry.value, column.type, column.validation);
      return {
        ...entry,
        isValid: !error,
        error: error || undefined
      };
    });
  };

  const handleSubmit = async () => {
    if (!categoryWithColumns || !school || !user) return;

    // Validate all entries before submitting
    const validatedEntries = validateEntries(formValues, categoryWithColumns.columns);
    setFormValues(validatedEntries);

    // Check if there are any validation errors
    const hasErrors = validatedEntries.some(entry => !entry.isValid);
    if (hasErrors) {
      toast.error(t('error'), {
        description: t('fixValidationErrors')
      });
      return;
    }

    // Prepare form data
    const formData: DataEntryForm = {
      categoryId: categoryWithColumns.id,
      schoolId: school.id,
      entries: validatedEntries.map(entry => ({
        name: entry.name,
        value: entry.value,
        columnId: entry.columnId,
        isValid: entry.isValid,
        status: entry.status,
        entryId: entry.entryId
      }))
    };

    setSaveStatus(DataEntrySaveStatus.SAVING);
    try {
      const { success, error } = await saveDataEntryForm(formData);
      if (success) {
        toast.success(t('success'), {
          description: t('dataSavedSuccessfully')
        });
        setSaveStatus(DataEntrySaveStatus.SAVED);
        setIsDirty(false);
      } else {
        toast.error(t('error'), {
          description: error || t('unknownError')
        });
        setSaveStatus(DataEntrySaveStatus.ERROR);
      }
    } catch (err: any) {
      toast.error(t('error'), {
        description: err.message || t('unknownError')
      });
      setSaveStatus(DataEntrySaveStatus.ERROR);
    } finally {
      setSaveStatus(DataEntrySaveStatus.IDLE);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!categoryWithColumns || !school) return;

    setIsSubmitDialogOpen(false);
    setSaveStatus(DataEntrySaveStatus.SAVING);

    const formData: DataEntryForm = {
      categoryId: categoryWithColumns.id,
      schoolId: school.id,
      entries: formValues.map(entry => ({
        name: entry.name,
        value: entry.value,
        columnId: entry.columnId,
        isValid: entry.isValid,
        status: entry.status,
        entryId: entry.entryId
      }))
    };

    try {
      const { success, error } = await submitForApproval(formData);
      if (success) {
        toast.success(t('success'), {
          description: t('dataSubmittedForApproval')
        });
        setSaveStatus(DataEntrySaveStatus.SAVED);
        setIsDirty(false);
        navigate('/dashboard');
      } else {
        toast.error(t('error'), {
          description: error || t('unknownError')
        });
        setSaveStatus(DataEntrySaveStatus.ERROR);
      }
    } catch (err: any) {
      toast.error(t('error'), {
        description: err.message || t('unknownError')
      });
      setSaveStatus(DataEntrySaveStatus.ERROR);
    } finally {
      setSaveStatus(DataEntrySaveStatus.IDLE);
    }
  };

  const handleApprove = () => {
    setIsApproveDialogOpen(true);
  };

  const handleReject = () => {
    setIsRejectDialogOpen(true);
  };

  if (isLoadingCategories || isLoadingSchool) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (categoriesError || schoolError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">
          {t('errorLoadingData')}
        </p>
      </div>
    );
  }

  if (!categoryWithColumns) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          {t('categoryNotFound')}
        </p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          {t('schoolNotFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {t('dataEntryForm')}
          </CardTitle>
          <CardDescription>
            {t('enterDataFor')} {categoryWithColumns.name} - {school.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <CategoryForm
            category={categoryWithColumns}
            values={formValues}
            onChange={handleValueChange}
            isDisabled={!isDirty}
            isLoading={saveStatus === DataEntrySaveStatus.SAVING}
            onApprove={handleApprove}
            onReject={handleReject}
            onSubmit={() => setIsSubmitDialogOpen(true)}
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 border-t">
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            {t('cancel')}
          </Button>
          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={!isDirty || saveStatus === DataEntrySaveStatus.SAVING}
            >
              {saveStatus === DataEntrySaveStatus.SAVING ? t('saving') + '...' : t('save')}
            </Button>
            <Button
              onClick={() => setIsSubmitDialogOpen(true)}
              disabled={!isDirty || saveStatus === DataEntrySaveStatus.SAVING}
            >
              {t('submit')}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <CategoryConfirmationDialog
        open={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirm={handleSubmitForApproval}
        title={t('submitConfirmationTitle')}
        description={t('submitConfirmationDescription')}
        confirmText={t('submit')}
        cancelText={t('cancel')}
      />

      <CategoryConfirmationDialog
        open={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={() => { }} // Implement approve logic here
        title={t('approveConfirmationTitle')}
        description={t('approveConfirmationDescription')}
        confirmText={t('approve')}
        cancelText={t('cancel')}
      />

      <CategoryConfirmationDialog
        open={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={() => { }} // Implement reject logic here
        title={t('rejectConfirmationTitle')}
        description={t('rejectConfirmationDescription')}
        confirmText={t('reject')}
        cancelText={t('cancel')}
      />
    </div>
  );
};

export default DataEntryFormComponent;
