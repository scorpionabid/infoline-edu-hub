import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from '@/hooks/form';
import { useValidation } from '@/hooks/useValidation';
import { useExcelOperations } from '@/hooks/useExcelOperations';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';
import { useDataUpdates } from '@/hooks/dataEntry/useDataUpdates';
import { useDataEntries } from '@/hooks/useDataEntries';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ColumnValidationError } from '@/types/dataEntry';

interface UseDataEntryStateReturn {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  currentIndex: number;
  setCategoryIndex: (index: number) => void;
  categoryIdRef: React.RefObject<string | null>;
  fetchCategoryData: () => Promise<void>;
}

export const useDataEntry = (initialCategoryId?: string | null, statusFilter?: string | null) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const urlCategoryId = queryParams.get('categoryId');
  const selectedCategoryId = initialCategoryId || urlCategoryId;

  const dataEntryState = useDataEntryState({
    initialCategoryId: selectedCategoryId || undefined
  });

  const { 
    categories,
    isLoading,
    currentIndex: currentCategoryIndex,
    setCategoryIndex: setCurrentCategoryIndex,
    categoryIdRef: lastCategoryIdRef,
    fetchCategoryData: fetchCategories
  } = dataEntryState;

  const { 
    dataEntries,
    loading: entriesLoading,
    fetchDataEntries,
    addDataEntry,
    updateDataEntry,
    submitCategoryForApproval
  } = useDataEntries(user?.schoolId);

  const { 
    formData, 
    isAutoSaving, 
    isSubmitting, 
    updateValue, 
    saveForm, 
    submitForm, 
    setupAutoSave,
    initializeForm 
  } = useForm(categories);
  
  const { errors, validateForm, getErrorForColumn } = useValidation(categories, formData.entries);

  const loadCategoryData = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn("İstifadəçi məktəb ID-si tapılmadı:", user);
      toast.error(t('notAuthenticated'), {
        description: t('pleaseLogin')
      });
      return;
    }

    try {
      console.log("Məktəb ID ilə məlumatlar yüklənir:", user.schoolId);
      
      await fetchCategories();

      const { data: existingData, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', user.schoolId);

      if (error) {
        console.error("Məlumat girdilərini əldə edərkən xəta:", error);
        throw error;
      }

      console.log("Məktəb üçün tapılan mövcud məlumat girdilərinin sayı:", existingData?.length || 0);
      
      if (existingData && existingData.length > 0) {
        const entriesByCategory: Record<string, any> = {};
        
        existingData.forEach(entry => {
          if (!entriesByCategory[entry.category_id]) {
            entriesByCategory[entry.category_id] = {
              categoryId: entry.category_id,
              values: [],
              isCompleted: false,
              isSubmitted: entry.status === 'pending' || entry.status === 'approved',
              completionPercentage: 0,
              approvalStatus: entry.status
            };
          }

          entriesByCategory[entry.category_id].values.push({
            columnId: entry.column_id,
            value: entry.value,
            status: entry.status,
            errorMessage: entry.status === 'rejected' ? entry.rejection_reason : undefined
          });
        });

        Object.keys(entriesByCategory).forEach(categoryId => {
          const category = categories.find(c => c.id === categoryId);
          if (category) {
            const requiredColumns = category.columns.filter(col => col.is_required);
            const filledRequiredValues = entriesByCategory[categoryId].values.filter(val => {
              const column = category.columns.find(col => col.id === val.columnId);
              return column?.is_required && val.value && val.value.trim() !== '';
            });
            
            entriesByCategory[categoryId].completionPercentage = requiredColumns.length > 0 
              ? (filledRequiredValues.length / requiredColumns.length) * 100 
              : 100;
              
            entriesByCategory[categoryId].isCompleted = entriesByCategory[categoryId].completionPercentage === 100;
          }
        });

        console.log("Formalaşdırılmış kateqoriya məlumatları:", entriesByCategory);
        
        initializeForm(Object.values(entriesByCategory), 'draft');
      } else {
        console.log("Bu məktəb üçün heç bir məlumat girişi tapılmadı");
      }
    } catch (err) {
      console.error('Kateqoriya məlumatlarını yükləmə xətası:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadData')
      });
    }
  }, [fetchCategories, user, categories, t, initializeForm]);

  const saveDataToServer = useCallback(async (categoryId: string, columnId: string, value: any) => {
    if (!user?.schoolId) return;

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('data_entries')
        .select('id, status')
        .eq('school_id', user.schoolId)
        .eq('category_id', categoryId)
        .eq('column_id', columnId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingData) {
        if (existingData.status === 'approved') {
          toast.error(t('cannotModifyApprovedData'), {
            description: t('contactAdmin')
          });
          return;
        }

        const { error: updateError } = await supabase
          .from('data_entries')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('data_entries')
          .insert([{
            school_id: user.schoolId,
            category_id: categoryId,
            column_id: columnId,
            value,
            status: 'pending',
            created_by: user.id
          }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error saving data to server:', err);
      throw err;
    }
  }, [user, t]);

  const handleUpdateValue = useCallback(async (categoryId: string, columnId: string, value: any) => {
    try {
      updateValue(categoryId, columnId, value);
      
      await saveDataToServer(categoryId, columnId, value);
    } catch (err) {
      console.error('Error updating value:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateData')
      });
    }
  }, [updateValue, saveDataToServer, t]);

  const handleSubmitForApproval = useCallback(async () => {
    if (!user?.schoolId || categories.length === 0) return;

    const currentCategory = categories[currentCategoryIndex];
    if (!currentCategory) return;

    try {
      saveForm();

      const isValid = validateForm();
      if (!isValid) {
        toast.error(t('validationError'), {
          description: t('pleaseFixErrors')
        });
        return;
      }

      await submitCategoryForApproval(currentCategory.id, user.schoolId);

      fetchCategories();

      toast.success(t('categorySubmitted'), {
        description: t('categorySubmittedDesc')
      });
    } catch (err) {
      console.error('Error submitting for approval:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotSubmitData')
      });
    }
  }, [categories, currentCategoryIndex, user, saveForm, validateForm, submitCategoryForApproval, fetchCategories, t]);

  const { updateFormDataFromExcel, changeCategory } = useDataUpdates({
    categories,
    formData,
    errors,
    initializeForm,
    validateForm,
    submitForm,
    setCurrentCategoryIndex,
    updateValue,
    saveForm
  });

  const { downloadExcelTemplate, uploadExcelData } = useExcelOperations(categories, async (data, categoryId) => {
    updateFormDataFromExcel(data, categoryId);
    
    if (user?.schoolId && categoryId) {
      try {
        for (const [columnId, value] of Object.entries(data)) {
          await saveDataToServer(categoryId, columnId, value);
        }
        
        toast.success(t('excelDataSaved'), {
          description: t('excelDataUploadedAndSaved')
        });
      } catch (err) {
        console.error('Error saving Excel data to server:', err);
        toast.error(t('errorOccurred'), {
          description: t('someDataMayNotBeSaved')
        });
      }
    }
  });

  useEffect(() => {
    if (user?.schoolId) {
      console.log("İstifadəçi məktəb ID-si ilə yüklənmə başladı:", user.schoolId);
      loadCategoryData();
    } else {
      console.warn("İstifadəçi məktəb ID-si olmadan yüklənmə:", user);
    }
  }, [loadCategoryData, user]);

  useEffect(() => {
    return setupAutoSave(validateForm);
  }, [setupAutoSave, validateForm]);

  useEffect(() => {
    if (!statusFilter || !categories.length) return;
    
    const categoryIndex = categories.findIndex(c => c.status === statusFilter);
    if (categoryIndex !== -1) {
      setCurrentCategoryIndex(categoryIndex);
    }
  }, [statusFilter, categories, setCurrentCategoryIndex]);

  return {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    changeCategory,
    updateValue: handleUpdateValue,
    submitForApproval: handleSubmitForApproval,
    saveForm,
    getErrorForColumn: (columnId: string) => getErrorForColumn(columnId),
    downloadExcelTemplate,
    uploadExcelData
  };
};
