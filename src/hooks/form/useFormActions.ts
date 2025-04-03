
import { useCallback, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm, ColumnEntry } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { v4 as uuid } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface UseFormActionsProps {
  formData: DataEntryForm;
  setFormData: React.Dispatch<React.SetStateAction<DataEntryForm>>;
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  categories: CategoryWithColumns[];
  schoolId?: string;
  userId?: string;
}

/**
 * Forma əməliyyatlarını idarə edən hook
 */
export const useFormActions = ({
  formData,
  setFormData,
  setIsAutoSaving,
  setIsSubmitting,
  categories,
  schoolId,
  userId
}: UseFormActionsProps) => {
  const { t } = useLanguage();
  const lastOperationTimeRef = useRef<number>(Date.now());
  
  // Dəyəri yeniləmək
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    lastOperationTimeRef.current = Date.now();
    
    setFormData(prev => {
      // Köhnə formdan yeni kopyasını yaradırıq
      const newEntries = [...prev.entries];
      const categoryIndex = newEntries.findIndex(entry => entry.categoryId === categoryId);
      
      if (categoryIndex !== -1) {
        // Mövcud sütunlar üçün dəyişiklikləri tətbiq edirik
        const values = [...newEntries[categoryIndex].values];
        const valueIndex = values.findIndex(v => v.columnId === columnId);
        
        if (valueIndex !== -1) {
          // Mövcud sütun varsa, onun dəyərini yeniləyirik
          values[valueIndex] = {
            ...values[valueIndex],
            value,
            status: 'pending'
          };
          
          // Əgər əvvəlcədən xəta var idisə, silək
          if (values[valueIndex].errorMessage) {
            delete values[valueIndex].errorMessage;
          }
        } else {
          // Yeni sütun qiymətini əlavə edirik
          values.push({
            id: uuid(), // UUID əlavə edildi
            columnId,
            value,
            status: 'pending'
          });
        }
        
        // Dəyişiklikləri tətbiq
        newEntries[categoryIndex] = {
          ...newEntries[categoryIndex],
          values
        };
        
        // Kateqoriya tamamlanma faizini yeniləmək
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          const requiredColumns = category.columns.filter(col => col.isRequired);
          const filledRequiredValues = values.filter(val => {
            const column = category.columns.find(col => col.id === val.columnId);
            return column?.isRequired && val.value !== '' && val.value !== null && val.value !== undefined;
          });
          
          const completionPercentage = requiredColumns.length > 0 
            ? (filledRequiredValues.length / requiredColumns.length) * 100 
            : 100;
            
          newEntries[categoryIndex].completionPercentage = completionPercentage;
          newEntries[categoryIndex].isCompleted = completionPercentage === 100;
        }
      }
      
      // Ümumi tamamlanma faizini yeniləmək
      const overallProgress = newEntries.reduce((sum, entry) => sum + entry.completionPercentage, 0) / newEntries.length;
      
      setIsAutoSaving(true);
      
      const updatedFormData = {
        ...prev,
        entries: newEntries,
        overallProgress,
        lastSaved: new Date().toISOString()
      };
      
      // LocalStorage-də saxlayaq
      localStorage.setItem('infolineFormData', JSON.stringify(updatedFormData));
      
      return updatedFormData;
    });
  }, [categories, setFormData, setIsAutoSaving]);
  
  // Manuel saxlama
  const saveForm = useCallback(async () => {
    lastOperationTimeRef.current = Date.now();
    
    if (!schoolId || !userId) {
      toast.error(t('missingUserOrSchoolData'));
      return;
    }
    
    try {
      setIsAutoSaving(true);
      
      // Hər bir kateqoriya və sütun üçün məlumatları yenilə
      for (const entry of formData.entries) {
        for (const value of entry.values) {
          // Əvvəlcə mövcud daxiletmə məlumatı var mı yoxlayaq
          const { data: existingEntry, error: fetchError } = await supabase
            .from('data_entries')
            .select('id, status')
            .eq('school_id', schoolId)
            .eq('category_id', entry.categoryId)
            .eq('column_id', value.columnId)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Mövcud məlumatı gətirərkən xəta:", fetchError);
            continue;
          }
          
          if (existingEntry) {
            // Əgər məlumat təsdiqlənibsə, update etmək olmaz
            if (existingEntry.status === 'approved') continue;
            
            // Əks halda update edək
            const { error: updateError } = await supabase
              .from('data_entries')
              .update({
                value: value.value,
                status: 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', existingEntry.id);
              
            if (updateError) {
              console.error("Məlumatı yeniləyərkən xəta:", updateError);
            }
          } else {
            // Yeni məlumat əlavə edək
            const { error: insertError } = await supabase
              .from('data_entries')
              .insert([{
                school_id: schoolId,
                category_id: entry.categoryId,
                column_id: value.columnId,
                value: value.value,
                status: 'draft',
                created_by: userId
              }]);
              
            if (insertError) {
              console.error("Yeni məlumat əlavə edərkən xəta:", insertError);
            }
          }
        }
      }
      
      toast.success(t('changesAutoSaved'));
      
      setFormData(prev => ({
        ...prev,
        lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Məlumatları saxlayarkən xəta:", error);
      toast.error(t('errorSavingData'));
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData, schoolId, userId, t, setFormData, setIsAutoSaving]);
  
  // Təsdiq üçün göndərmək
  const submitForm = useCallback(async (validateFn: () => boolean) => {
    lastOperationTimeRef.current = Date.now();
    const isValid = validateFn();
    
    if (!isValid) {
      toast.error(t('formHasErrors'));
      return false;
    }
    
    if (!schoolId || !userId) {
      toast.error(t('missingUserOrSchoolData'));
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      // Hər bir kateqoriya və sütun üçün məlumatları təsdiq üçün göndər
      for (const entry of formData.entries) {
        // Kateqoriya üçün tamamlanma yoxlaması
        if (!entry.isCompleted) {
          toast.error(t('categoryNotCompleted'), {
            description: categories.find(c => c.id === entry.categoryId)?.name
          });
          setIsSubmitting(false);
          return false;
        }
        
        for (const value of entry.values) {
          // Əvvəlcə mövcud daxiletmə məlumatı var mı yoxlayaq
          const { data: existingEntry, error: fetchError } = await supabase
            .from('data_entries')
            .select('id, status')
            .eq('school_id', schoolId)
            .eq('category_id', entry.categoryId)
            .eq('column_id', value.columnId)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Mövcud məlumatı gətirərkən xəta:", fetchError);
            continue;
          }
          
          if (existingEntry) {
            // Əgər məlumat təsdiqlənibsə, update etmək olmaz
            if (existingEntry.status === 'approved') continue;
            
            // Əks halda update edək
            const { error: updateError } = await supabase
              .from('data_entries')
              .update({
                value: value.value,
                status: 'pending',
                updated_at: new Date().toISOString()
              })
              .eq('id', existingEntry.id);
              
            if (updateError) {
              console.error("Məlumatı təsdiq üçün göndərərkən xəta:", updateError);
              toast.error(t('errorSubmittingData'));
              setIsSubmitting(false);
              return false;
            }
          } else {
            // Yeni məlumat əlavə edək
            const { error: insertError } = await supabase
              .from('data_entries')
              .insert([{
                school_id: schoolId,
                category_id: entry.categoryId,
                column_id: value.columnId,
                value: value.value,
                status: 'pending',
                created_by: userId
              }]);
              
            if (insertError) {
              console.error("Yeni məlumatı təsdiq üçün göndərərkən xəta:", insertError);
              toast.error(t('errorSubmittingData'));
              setIsSubmitting(false);
              return false;
            }
          }
        }
      }
      
      // Formun statusunu və tarixini yenilə
      setFormData(prev => ({
        ...prev,
        status: 'pending',
        lastSaved: new Date().toISOString()
      }));
      
      toast.success(t('submissionSuccess'), {
        description: t('submissionDescription')
      });
      
      return true;
    } catch (error) {
      console.error("Təsdiq prosesində xəta:", error);
      toast.error(t('errorSubmittingForm'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, categories, schoolId, userId, t, setFormData, setIsSubmitting]);
  
  return {
    updateValue,
    saveForm,
    submitForm,
    lastOperationTimeRef
  };
};
