import { supabase } from '@/integrations/supabase/client';
import { DataEntryForm, EntryValue, DataEntryStatus } from '@/types/dataEntry';

// Data entry formunu yadda saxla
export const saveDataEntryForm = async (formData: DataEntryForm): Promise<{
  success: boolean;
  error?: string;
  id?: string;
}> => {
  try {
    const { entries, ...formInfo } = formData;

    // Form data-dan gələn məlumatları əlavə bir id property ilə genişləndiririk
    // TypeScript error-dan qaçmaq üçün formInfo obyektini genişləndirilmiş tipə cast edirik
    const extendedFormInfo = formInfo as typeof formInfo & { id?: string };
    
    // Əgər artıq bir ID varsa, mövcud yazıları silirik
    if (extendedFormInfo.id) {
      await supabase
        .from('data_entries')
        .delete()
        .eq('category_id', formInfo.categoryId)
        .eq('school_id', formInfo.schoolId);
    }

    // Yeni yazıları əlavə edirik
    for (const entry of entries) {
      await supabase.from('data_entries').insert({
        school_id: formInfo.schoolId,
        category_id: formInfo.categoryId,
        column_id: entry.columnId,
        value: entry.value,
        status: entry.status || 'pending',
        created_by: (await supabase.auth.getUser()).data.user?.id
      });
    }

    // Form məlumatlarını yeniləmək üçün qeyd
    // Həqiqi layihədə burada formun özü də saxlanıla bilər

    return {
      success: true,
      id: extendedFormInfo.id || `form-${Date.now()}`
    };
  } catch (error: any) {
    console.error('Form yadda saxlanarkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

// Məktəb ID və Kateqoriya ID-yə görə yazıları al
export const getDataEntries = async (
  schoolId: string,
  categoryId: string
): Promise<{
  success: boolean;
  data?: EntryValue[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);

    if (error) throw error;

    const entries = data.map(entry => ({
      id: entry.id,
      columnId: entry.column_id,
      value: entry.value,
      status: entry.status as DataEntryStatus // Status dəyərini DataEntryStatus tipinə cast edirik
    }));

    return {
      success: true,
      data: entries
    };
  } catch (error: any) {
    console.error('Yazıları əldə edərkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

// Təsdiq üçün göndər
export const submitForApproval = async (
  formData: DataEntryForm
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Burada təsdiq üçün göndərmə əməliyyatı həyata keçirilir
    // Həqiqi layihədə, burada status yenilənməsi və bildiriş göndərilməsi olacaq

    await supabase
      .from('data_entries')
      .update({
        status: 'pending'
      })
      .eq('school_id', formData.schoolId)
      .eq('category_id', formData.categoryId);

    return { success: true };
  } catch (error: any) {
    console.error('Təsdiq üçün göndərilirkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};
