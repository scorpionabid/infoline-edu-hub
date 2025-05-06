import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { EntryValue, DataEntrySaveStatus, DataEntryStatus } from '@/types/dataEntry';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useSchool } from '@/hooks/dataEntry/useSchool';
import { CategoryConfirmationDialog } from './CategoryConfirmationDialog';
import { validateField } from './utils/formUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryWithColumns, Column } from '@/types/column';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface DataEntryFormProps {
  categoryId?: string;
}

// Sütun komponenti
const ColumnField = ({ column, value, onChange, disabled = false }) => {
  const renderField = () => {
    switch (column.type) {
      case 'text':
        return (
          <input
            type="text"
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className="w-full p-2 border rounded-md"
            required={column.is_required}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className="w-full p-2 border rounded-md min-h-[100px]"
            required={column.is_required}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className="w-full p-2 border rounded-md"
            required={column.is_required}
          />
        );
        
      case 'select':
        // Options dəyərini təhlükəsiz şəkildə işləmək
        const columnOptions = column.options || [];
        let parsedOptions = [];
        
        if (Array.isArray(columnOptions)) {
          parsedOptions = columnOptions;
        } else if (typeof columnOptions === 'string') {
          // String formatında olduqda, JSON.parse etməyə çalışırıq
          try {
            parsedOptions = JSON.parse(columnOptions);
            if (!Array.isArray(parsedOptions)) {
              parsedOptions = [];
            }
          } catch (e) {
            console.error('JSON parse error:', e);
            parsedOptions = [];
          }
        } else if (typeof columnOptions === 'object' && columnOptions !== null) {
          // Obyekt olduqda array formatına çeviririk
          parsedOptions = Object.entries(columnOptions).map(([value, label]) => ({
            value,
            label: label as string
          }));
        }
        
        return (
          <select
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            className="w-full p-2 border rounded-md"
            required={column.is_required}
          >
            <option value="">{column.placeholder || 'Seçin'}</option>
            {parsedOptions.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value || '' : option;
              const optionLabel = typeof option === 'object' ? option.label || optionValue : option;
              return (
                <option key={optionValue || index} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            className="w-full p-2 border rounded-md"
            required={column.is_required}
          />
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={column.id}
              checked={value === 'true'}
              onChange={(e) => onChange(column.id, e.target.checked ? 'true' : 'false')}
              disabled={disabled}
              className="mr-2"
            />
            <label htmlFor={column.id}>{column.placeholder || column.name}</label>
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className="w-full p-2 border rounded-md"
            required={column.is_required}
          />
        );
    }
  };
  
  return (
    <div className="space-y-2">
      <label htmlFor={column.id} className="text-sm font-medium">
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {column.help_text && (
        <p className="text-xs text-gray-500">{column.help_text}</p>
      )}
    </div>
  );
};

const DataEntryFormComponent: React.FC<DataEntryFormProps> = ({ categoryId }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useParams();
  
  // URL-dən kateqoriya ID-sini əldə edirik (əgər varsa)
  const categoryIdFromUrl = params.categoryId || categoryId;

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>('idle');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [entryData, setEntryData] = useState<any[]>([]);

  const {
    categories,
    loading: isLoading,
    error: categoriesError
  } = useCategoryData();
  
  const { school, isLoading: isLoadingSchool, error: schoolError } = useSchool();

  // Seçilmiş kateqoriya
  const selectedCategory = React.useMemo(() => {
    if (!selectedCategoryId || !categories) return null;
    return categories.find(cat => cat.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  // Kateqoriyalar yükləndikdə və URL-də ID varsa onu təyin edirik
  useEffect(() => {
    if (categories.length > 0) {
      if (categoryIdFromUrl) {
        const found = categories.find(cat => cat.id === categoryIdFromUrl);
        if (found) {
          setSelectedCategoryId(found.id);
        } else {
          // Əgər URL-də olan ID tapılmadısa, ilk kateqoriyanı seç
          setSelectedCategoryId(categories[0].id);
        }
      } else if (!selectedCategoryId) {
        // Əgər hələ kateqoriya seçilməyibsə, ilk kateqoriyanı seç
        setSelectedCategoryId(categories[0].id);
      }
    }
  }, [categories, categoryIdFromUrl, selectedCategoryId]);

  // Mövcud məlumatları yükləyirik
  useEffect(() => {
    const fetchEntryData = async () => {
      if (!selectedCategoryId || !school?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', school.id)
          .eq('category_id', selectedCategoryId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Məlumatları formValues formatına çeviririk
          const newFormValues = {};
          data.forEach(entry => {
            newFormValues[entry.column_id] = entry.value;
          });
          setFormValues(newFormValues);
          setEntryData(data);
        } else {
          // Əgər məlumat yoxdursa, formu sıfırlayırıq
          setFormValues({});
          setEntryData([]);
        }
        
        setIsDirty(false);
      } catch (error) {
        console.error('Məlumatları yükləyərkən xəta:', error);
        toast.error(t('errorFetchingData'));
      }
    };
    
    fetchEntryData();
  }, [selectedCategoryId, school, t]);

  const handleValueChange = (columnId: string, value: string) => {
    setIsDirty(true);
    setFormValues(prevValues => ({
      ...prevValues,
      [columnId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !school || !user) {
      toast.error(t('missingRequiredInfo'));
      return;
    }

    // Məcburi sahələri yoxlayırıq
    const requiredColumns = selectedCategory.columns.filter(col => col.is_required);
    const missingFields = requiredColumns.filter(col => !formValues[col.id]);
    
    if (missingFields.length > 0) {
      toast.error(t('fillRequiredFields'), {
        description: missingFields.map(col => col.name).join(', ')
      });
      return;
    }

    setSaveStatus('saving');
    try {
      // Əvvəlcə köhnə məlumatları silirik (əgər varsa)
      if (entryData.length > 0) {
        await supabase
          .from('data_entries')
          .delete()
          .eq('school_id', school.id)
          .eq('category_id', selectedCategory.id);
      }
      
      // Yeni məlumatları əlavə edirik
      const entries = selectedCategory.columns.map(column => ({
        school_id: school.id,
        category_id: selectedCategory.id,
        column_id: column.id,
        value: formValues[column.id] || '',
        status: 'draft',
        created_by: user.id
      }));
      
      const { error } = await supabase
        .from('data_entries')
        .insert(entries);
        
      if (error) throw error;
      
      toast.success(t('dataSavedSuccessfully'));
      setIsDirty(false);
      setSaveStatus('saved');
    } catch (err: any) {
      toast.error(t('errorSavingData'), {
        description: err.message
      });
      setSaveStatus('error');
    } finally {
      setSaveStatus('idle');
    }
  };

  const handleSubmitForApproval = async () => {
    await handleSubmit(new Event('submit') as any);
    setIsSubmitDialogOpen(false);
    
    if (!selectedCategory || !school) return;
    
    setSaveStatus('submitting');
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ status: 'pending' })
        .eq('school_id', school.id)
        .eq('category_id', selectedCategory.id);
        
      if (error) throw error;
      
      toast.success(t('dataSubmittedForApproval'));
      setSaveStatus('submitted');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(t('errorSubmittingData'), {
        description: err.message
      });
    } finally {
      setSaveStatus('idle');
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    if (isDirty) {
      const confirmed = window.confirm(t('confirmChangingCategory'));
      if (!confirmed) return;
    }
    
    setSelectedCategoryId(newCategoryId);
    
    // URL-i yeniləyirik
    navigate(`/data-entry/${newCategoryId}`, { replace: true });
  };

  if (isLoading || isLoadingSchool) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (categoriesError || schoolError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t('errorLoadingData')}
        </AlertDescription>
      </Alert>
    );
  }

  if (categories.length === 0) {
    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('noCategories')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Kateqoriyalar paneli */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('categories')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-15rem)]">
                <div className="space-y-1 p-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategoryId === category.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        selectedCategoryId === category.id ? "font-medium" : ""
                      )}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Form paneli */}
        <div className="md:col-span-3">
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCategory.name}</CardTitle>
                <CardDescription>
                  {selectedCategory.description || t('fillOutForm')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {selectedCategory.columns.map(column => (
                    <ColumnField
                      key={column.id}
                      column={column}
                      value={formValues[column.id] || ''}
                      onChange={handleValueChange}
                      disabled={saveStatus === 'saving' || saveStatus === 'submitting'}
                    />
                  ))}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('confirmReset'))) {
                      setFormValues({});
                      setIsDirty(true);
                    }
                  }}
                  disabled={saveStatus === 'saving' || saveStatus === 'submitting'}
                >
                  {t('reset')}
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleSubmit}
                    disabled={!isDirty || saveStatus === 'saving' || saveStatus === 'submitting'}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      t('saveDraft')
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsSubmitDialogOpen(true)}
                    disabled={saveStatus === 'saving' || saveStatus === 'submitting'}
                  >
                    {saveStatus === 'submitting' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('submitting')}
                      </>
                    ) : (
                      t('submit')
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p>{t('selectCategoryToFill')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CategoryConfirmationDialog
        open={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirm={handleSubmitForApproval}
        title={t('submitConfirmationTitle')}
        description={t('submitConfirmationDescription')}
        confirmText={t('submit')}
        cancelText={t('cancel')}
      />
    </div>
  );
};

export default DataEntryFormComponent;
