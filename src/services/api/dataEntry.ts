import { supabase } from '@/lib/supabase';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

/**
 * Məlumat daxil etmələrini əldə etmək üçün sorğu parametrləri
 */
export interface FetchDataEntriesOptions {
  categoryId: string;
  schoolId: string;
}

/**
 * Məlumat daxil etmələrini əldə etmək üçün mərkəzi servis funksiyası
 * 
 * @param options Sorğu parametrləri (kateqoriya ID və məktəb ID)
 * @returns Məlumat daxil etmələri massivi
 */
export async function fetchDataEntries({ categoryId, schoolId }: FetchDataEntriesOptions): Promise<DataEntry[]> {
  try {
    // Tələb olunan ID-lərin mövcudluğunu yoxlayırıq
    if (!categoryId || !schoolId) {
      console.error('Missing required IDs for data entries fetch:', { categoryId, schoolId });
      throw new Error('Kateqoriya və ya məktəb ID-si çatışmır');
    }

    console.log(`Fetching data entries for category ${categoryId} and school ${schoolId}`);
    
    // Supabase sorğusu
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('school_id', schoolId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching data entries:', error);
      throw error;
    }

    // Potensial boş data halını idarə edirik
    if (!data) {
      console.log('No data entries found');
      return [];
    }

    // Təmizlənmiş və təhlükəsiz data entries qaytarırıq
    const safeEntries = data.map(entry => ({
      ...entry,
      value: entry.value !== undefined && entry.value !== null ? entry.value : '',
      status: entry.status || DataEntryStatus.DRAFT
    }));

    console.log(`Successfully fetched ${safeEntries.length} data entries`);
    return safeEntries as DataEntry[];
  } catch (error) {
    console.error('Error in fetchDataEntries:', error);
    throw error;
  }
}

/**
 * Məlumat daxil etmələrini saxlamaq üçün mərkəzi servis funksiyası
 * 
 * @param entries Saxlanılacaq məlumat daxil etmələri
 * @param categoryId Kateqoriya ID
 * @param schoolId Məktəb ID
 * @returns Əməliyyatın nəticəsi
 */
export async function saveDataEntries(
  entries: Partial<DataEntry>[],
  categoryId: string,
  schoolId: string
): Promise<DataEntry[]> {
  try {
    // Tələb olunan ID-lərin mövcudluğunu yoxlayırıq
    if (!categoryId || !schoolId) {
      throw new Error('Kateqoriya və ya məktəb ID-si çatışmır');
    }

    // Entries massivinin etibarlılığını yoxlayırıq
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('Saxlanılacaq məlumat yoxdur');
    }

    console.log('About to save data entries:', { categoryId, schoolId, entriesCount: entries.length });
    
    // Entries massivini emal edirik
    const processedEntries = entries.map(entry => {
      // Tələb olunan ID-lərin mövcudluğunu yoxlayırıq
      if (!entry.column_id) {
        console.warn('Entry without column_id found:', entry);
        throw new Error('Sütun ID-si olmayan məlumat daxil etməsi');
      }
      
      // Təmizlənmiş və tam məlumat daxil etməsi yaradırıq
      return {
        column_id: entry.column_id,
        category_id: categoryId,
        school_id: schoolId,
        value: entry.value ?? '',
        status: entry.status || DataEntryStatus.DRAFT,
        updated_at: new Date().toISOString(),
        ...(entry.id ? { id: entry.id } : {})
      };
    });

    // Supabase sorğusu - upsert (insert or update)
    const { data, error } = await supabase
      .from('data_entries')
      .upsert(processedEntries, {
        onConflict: 'column_id,school_id,category_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Error saving data entries:', error);
      throw error;
    }

    console.log(`Successfully saved ${processedEntries.length} data entries`);
    return data as DataEntry[];
  } catch (error) {
    console.error('Error in saveDataEntries:', error);
    throw error;
  }
}

/**
 * Bütün məlumat daxil etmələrini yeniləmək üçün mərkəzi servis funksiyası
 * 
 * @param entries Yenilənəcək məlumat daxil etmələri
 * @param status Yeni status
 * @returns Əməliyyatın nəticəsi
 */
export async function updateDataEntriesStatus(
  entries: DataEntry[],
  status: DataEntryStatus
): Promise<void> {
  try {
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('Yenilənəcək məlumat yoxdur');
    }

    // ID-ləri əldə edirik
    const entryIds = entries.map(entry => entry.id).filter(Boolean);
    
    if (entryIds.length === 0) {
      throw new Error('Etibarlı ID-ləri olan məlumat daxil etmələri tapılmadı');
    }

    // Supabase sorğusu - update
    const { error } = await supabase
      .from('data_entries')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', entryIds);

    if (error) {
      console.error('Error updating data entries status:', error);
      throw error;
    }

    console.log(`Successfully updated status for ${entryIds.length} data entries to ${status}`);
  } catch (error) {
    console.error('Error in updateDataEntriesStatus:', error);
    throw error;
  }
}
