import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import CategoryForm from './CategoryForm';
import { EntryValue, DataEntrySaveStatus } from '@/types/dataEntry';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useSchool } from '@/hooks/dataEntry/useSchool';
import { CategoryConfirmationDialog } from './CategoryConfirmationDialog';
import { validateEntries } from './utils/formUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DataEntryFormComponent: React.FC<{ categoryId?: string }> = ({ categoryId }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formValues, setFormValues] = useState<EntryValue[]>([]);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId || '');

  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    loading: categoriesLoading
  } = useCategoryData();
  const { school, isLoading: isLoadingSchool, error: schoolError } = useSchool();

  const category = React.useMemo(() => {
    if (!selectedCategoryId || !categories) return null;
    return categories.find(cat => cat.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  useEffect(() => {
    // Əgər kateqoriya ID verilməyibsə və kateqoriyalar yüklənibsə, ilk kateqoriyanı seç
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (category && school) {
      fetchInitialValues(school.id, category.id);
    }
  }, [category, school]);

  const fetchInitialValues = useCallback(
    async (schoolId: string, categoryId: string) => {
      if (!schoolId || !categoryId) return;

      try {
        // Burada serverdən məlumatları əldə etmək üçün funksiya çağırılmalıdır
        // Hələlik nümunə olaraq boş dəyərlər istifadə edək
        const initialValues = category?.columns?.map(column => ({
          columnId: column.id,
          categoryId: category.id,
          value: '',
          name: column.name,
          isValid: true
        })) || [];
        
        setFormValues(initialValues);
      } catch (error: any) {
        toast.error(t('error'), {
          description: t('errorFetchingDataEntries')
        });
      }
    },
    [t, category]
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

  const handleSubmit = async () => {
    if (!category || !school || !user) return;

    // Validate all entries before submitting
    const validatedEntries = validateEntries(formValues, category.columns);
    setFormValues(validatedEntries);

    // Check if there are any validation errors
    const hasErrors = validatedEntries.some(entry => !entry.isValid);
    if (hasErrors) {
      toast.error(t('error'), {
        description: t('fixValidationErrors')
      });
      return;
    }

    setSaveStatus(DataEntrySaveStatus.SAVING);
    try {
      // Burada serverdə saxlama əməliyyatı simulyasiya edirik
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('success'), {
        description: t('dataSavedSuccessfully')
      });
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDirty(false);
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
    await handleSubmit();
    setIsSubmitDialogOpen(false);
    
    // Təsdiq üçün göndərmə simulyasiyası
    setSaveStatus(DataEntrySaveStatus.SUBMITTING);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('success'), {
        description: t('dataSubmittedForApproval')
      });
      setSaveStatus(DataEntrySaveStatus.SUBMITTED);
      setIsDirty(false);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(t('error'), {
        description: err.message || t('unknownError')
      });
    } finally {
      setSaveStatus(DataEntrySaveStatus.IDLE);
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    // Əgər form dəyişilmiş haldadırsa, onda xəbərdarlıq ver
    if (isDirty) {
      const confirmed = window.confirm(t('confirmChangingCategory'));
      if (!confirmed) {
        return;
      }
    }
    
    setSelectedCategoryId(newCategoryId);
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

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category && categories.length > 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-4xl mx-auto shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {t('dataEntryForm')}
            </CardTitle>
            <CardDescription>
              {t('selectCategoryToFill')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <Card 
                  key={cat.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="ghost" className="w-full">
                      {t('selectCategory')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {categories.length > 0 && (
        <div className="mb-6">
          <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {category && (
        <Card className="w-full max-w-4xl mx-auto shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {t('dataEntryForm')}
            </CardTitle>
            <CardDescription>
              {category.name} {school && `- ${school.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <CategoryForm
              category={category}
              values={formValues}
              onChange={handleValueChange}
              onSubmit={() => setIsSubmitDialogOpen(true)}
              isDisabled={saveStatus === DataEntrySaveStatus.SAVING || saveStatus === DataEntrySaveStatus.SUBMITTING}
              isLoading={saveStatus === DataEntrySaveStatus.SAVING || saveStatus === DataEntrySaveStatus.SUBMITTING}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center p-4 border-t">
            <Button
              variant="secondary"
              onClick={() => navigate('/forms')}
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
      )}

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
        onConfirm={() => {}} // İmplementasiya ediləcək
        title={t('approveConfirmationTitle')}
        description={t('approveConfirmationDescription')}
        confirmText={t('approve')}
        cancelText={t('cancel')}
      />

      <CategoryConfirmationDialog
        open={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={() => {}} // İmplementasiya ediləcək
        title={t('rejectConfirmationTitle')}
        description={t('rejectConfirmationDescription')}
        confirmText={t('reject')}
        cancelText={t('cancel')}
      />
    </div>
  );
};

export default DataEntryFormComponent;
