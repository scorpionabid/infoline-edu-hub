import { supabase } from '@/integrations/supabase/client';
import { DataEntryForm, EntryValue, DataEntry } from '@/types/dataEntry';

/**
 * Məlumat elementlərini əldə edir
 * @param params Sorğu parametrləri
 */
export const getDataEntries = async (params: {
  schoolId?: string;
  categoryId?: string;
  columnId?: string;
  status?: string;
}): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  try {
    let query = supabase
      .from('data_entries')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filtrlər əlavə et
    if (params.schoolId) {
      query = query.eq('school_id', params.schoolId);
    }
    
    if (params.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }
    
    if (params.columnId) {
      query = query.eq('column_id', params.columnId);
    }
    
    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const entries = data?.map(entry => ({
      id: entry.id,
      columnId: entry.column_id,
      value: entry.value,
      status: entry.status
    })) || [];

    return {
      success: true,
      data: entries
    };
  } catch (error: any) {
    console.error('Məlumat elementlərini əldə edərkən xəta:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

// Data entry formunu yadda saxla
export const saveDataEntryForm = async (formData: DataEntryForm): Promise<{
  success: boolean;
  error?: string;
  id?: string;
}> => {
  try {
    const { entries, ...formInfo } = formData;

    // Əgər artıq bir ID varsa, mövcud yazıları silirik
    if (formInfo.id) {
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

    return {
      success: true,
      id: formInfo.id || `form-${Date.now()}`
    };
  } catch (error: any) {
    console.error('Form yadda saxlanarkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

/**
 * Məlumat elementini əlavə edir
 * @param dataEntry Əlavə ediləcək məlumat elementi
 */
export const addDataEntry = async (dataEntry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .insert([dataEntry])
      .select()
      .single();

    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Məlumat elementi əlavə edərkən xəta:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

/**
 * Məlumat elementini yeniləyir
 * @param id Yenilənəcək elementin ID-si
 * @param updates Yeniləmələr
 */
export const updateDataEntry = async (id: string, updates: Partial<DataEntry>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Məlumat elementi yeniləyərkən xəta:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

/**
 * Məlumat elementini silir
 * @param id Silinəcək elementin ID-si
 */
export const deleteDataEntry = async (id: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from('data_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Məlumat elementi silirkən xəta:', error);
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

/**
 * Məlumat elementini təsdiqləyir
 * @param id Təsdiqlənəcək elementin ID-si
 */
export const approveDataEntry = async (id: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('data_entries')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Məlumat elementi təsdiqləyərkən xəta:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

/**
 * Məlumat elementini rədd edir
 * @param id Rədd ediləcək elementin ID-si
 * @param rejectionReason Rədd səbəbi
 */
export const rejectDataEntry = async (id: string, rejectionReason: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    if (!rejectionReason) {
      throw new Error('Rədd səbəbi tələb olunur');
    }

    const { data, error } = await supabase
      .from('data_entries')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: (await supabase.auth.getUser()).data.user?.id,
        rejection_reason: rejectionReason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Məlumat elementi rədd edərkən xəta:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta'
    };
  }
};
