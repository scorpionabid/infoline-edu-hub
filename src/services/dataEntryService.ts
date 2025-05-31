import { supabase } from '@/integrations/supabase/client';
import { DataEntryForm, DataEntryStatus } from '@/types/dataEntry';

// Entry interface to represent single data entry
export interface EntryValue {
  columnId: string;
  value: any; // Allow any type of value since we store different types
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
}

// Common interface for service responses
export interface ServiceResponse {
  success: boolean;
  error?: string;
  message?: string;
  id?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  errors?: Record<string, string>;
}

// Data entry formunu yadda saxla - updated to accept direct parameters
export const saveDataEntryForm = async (
  schoolId: string,
  categoryId: string,
  entries: EntryValue[]
): Promise<ServiceResponse> => {
  try {
    // Əgər artıq yazılar varsa, mövcud yazıları silirik
    await supabase
      .from('data_entries')
      .delete()
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);

    // Yeni yazıları əlavə edirik
    for (const entry of entries) {
      await supabase.from('data_entries').insert({
        school_id: schoolId,
        category_id: categoryId,
        column_id: entry.columnId,
        value: entry.value,
        status: entry.status || 'draft',
        created_by: (await supabase.auth.getUser()).data.user?.id
      });
    }

    return {
      success: true,
      id: `form-${Date.now()}`,
      status: 'draft',
      message: 'Data saved successfully'
    };
  } catch (error: any) {
    console.error('Form yadda saxlanarkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta',
      message: 'Error saving data',
      errors: { general: error.message || 'Bilinməyən xəta' }
    };
  }
};

// Məktəb ID və Kateqoriya ID-yə görə yazıları al
export const getDataEntries = async (
  schoolId: string,
  categoryId: string
): Promise<ServiceResponse & {
  data?: EntryValue[];
}> => {
  console.group('getDataEntries call');
  console.log('Request params:', { schoolId, categoryId });

  try {
    // Giriş parametrlərini yoxla
    if (!schoolId || !categoryId) {
      console.warn('Empty parameters detected', { schoolId, categoryId });
      console.groupEnd();
      return {
        success: false,
        error: 'Missing required parameters',
        message: 'School ID and Category ID are required',
        data: []
      };
    }

    // Sorğunu icra et
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);

    console.log('Supabase response:', { data: data?.length || 0, error });

    if (error) {
      console.error('Supabase error:', error);
      console.groupEnd();
      throw error;
    }

    // Boş nəticəyə qarşı yoxla
    if (!data || data.length === 0) {
      console.log('No entries found for the given parameters');
      console.groupEnd();
      return {
        success: true,
        data: [],
        message: 'No entries found'
      };
    }

    // Verilənləri çevir
    const entries = data.map(entry => ({
      id: entry.id,
      columnId: entry.column_id,
      value: entry.value,
      status: entry.status as DataEntryStatus // Status dəyərini DataEntryStatus tipinə cast edirik
    }));

    console.log('Transformed entries:', entries.length);
    console.groupEnd();
    return {
      success: true,
      data: entries
    };
  } catch (error: any) {
    console.error('Error in getDataEntries:', error);
    console.groupEnd();
    console.error('Yazıları əldə edərkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta',
      message: 'Error loading data',
      errors: { general: error.message || 'Bilinməyən xəta' }
    };
  }
};

// Təsdiq üçün göndər - yenilənmiş versiya birbaşa school və category ID-lərini qəbul edir
export const submitForApproval = async (
  schoolId: string,
  categoryId: string
): Promise<ServiceResponse> => {
  try {
    // Burada təsdiq üçün göndərmə əməliyyatı həyata keçirilir
    // Status yenilənməsi

    await supabase
      .from('data_entries')
      .update({
        status: 'pending'
      })
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);

    return { 
      success: true, 
      status: 'pending',
      message: 'Data submitted for approval' 
    };
  } catch (error: any) {
    console.error('Təsdiq üçün göndərilirkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta',
      message: 'Error submitting data',
      errors: { general: error.message || 'Bilinməyən xəta' }
    };
  }
};
