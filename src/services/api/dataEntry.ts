import { supabase } from '@/lib/supabase';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
// useAuthStore hook-u service layer-də çağırılmamalıdır
// User ID-ni component layer-dən parameter kimi alacağıq

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
 * @param userId İstifadəçi ID (created_by üçün)
 * @returns Əməliyyatın nəticəsi
 */
export async function saveDataEntries(
  entries: Partial<DataEntry>[],
  categoryId: string,
  schoolId: string,
  userId?: string | null
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

    console.log('About to save data entries:', { categoryId, schoolId, entriesCount: entries.length, userId });
    console.log('User ID type and value:', { userId, type: typeof userId, isNull: userId === null, isUndefined: userId === undefined });
    
    // Əvvəlcə mövcud entries-ləri əldə edirik
    const { data: existingEntries, error: fetchError } = await supabase
      .from('data_entries')
      .select('id, column_id, school_id, category_id')
      .eq('category_id', categoryId)
      .eq('school_id', schoolId)
      .is('deleted_at', null);

    if (fetchError) {
      console.error('Error fetching existing entries:', fetchError);
      throw fetchError;
    }

    // Mövcud entries-ləri map-ə çeviririk
    const existingMap = new Map();
    (existingEntries || []).forEach(entry => {
      existingMap.set(entry.column_id, entry.id);
    });

    // Entries massivini emal edirik
    const entriesToInsert: any[] = [];
    const entriesToUpdate: any[] = [];

    entries.forEach(entry => {
      // Tələb olunan ID-lərin mövcudluğunu yoxlayırıq
      if (!entry.column_id) {
        console.warn('Entry without column_id found:', entry);
        throw new Error('Sütun ID-si olmayan məlumat daxil etməsi');
      }
      
      // Təmizlənmiş məlumat hazırlayırıq
      const processedEntry = {
        column_id: entry.column_id,
        category_id: categoryId,
        school_id: schoolId,
        value: entry.value ?? '',
        status: entry.status || DataEntryStatus.DRAFT,
        created_by: userId && userId !== 'system' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ? userId : null, // UUID validation + block 'system'
        updated_at: new Date().toISOString()
      };

      // Mövcudluq yoxlanışı
      const existingId = existingMap.get(entry.column_id);
      
      if (existingId) {
        // Yenile
        entriesToUpdate.push({ ...processedEntry, id: existingId });
      } else {
        // Əlavə et
        entriesToInsert.push(processedEntry);
      }
    });

    const results: DataEntry[] = [];

    // INSERT əməliyyatları
    if (entriesToInsert.length > 0) {
      console.log('Entries to insert:', JSON.stringify(entriesToInsert, null, 2));
      const { data: insertedData, error: insertError } = await supabase
        .from('data_entries')
        .insert(entriesToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting data entries:', insertError);
        console.error('Insert error details:', JSON.stringify(insertError, null, 2));
        console.error('Failed entries:', JSON.stringify(entriesToInsert, null, 2));
        throw insertError;
      }

      if (insertedData) {
        results.push(...(insertedData as DataEntry[]));
      }
    }

    // UPDATE əməliyyatları
    for (const updateEntry of entriesToUpdate) {
      const { data: updatedData, error: updateError } = await supabase
        .from('data_entries')
        .update({
          value: updateEntry.value,
          status: updateEntry.status,
          updated_at: updateEntry.updated_at
        })
        .eq('id', updateEntry.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating data entry:', updateError);
        throw updateError;
      }

      if (updatedData) {
        results.push(updatedData as DataEntry);
      }
    }

    console.log(`Successfully saved ${results.length} data entries`);
    return results;
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
