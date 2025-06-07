import { supabase } from '@/lib/supabase';
import { DataEntry } from '@/types/dataEntry';

/**
 * Məlumat daxil etmələrini əldə etmək üçün sorğu parametrləri
 */
export interface FetchDataEntriesOptions {
  categoryId: string;
  schoolId: string;
}

/**
 * Məlumat daxil etmələrini əldə etmək üçün mərkəzi servis funksiyası
 */
export async function fetchDataEntries({ categoryId, schoolId }: FetchDataEntriesOptions): Promise<DataEntry[]> {
  try {
    if (!categoryId || !schoolId) {
      console.error('Missing required IDs for data entries fetch:', { categoryId, schoolId });
      throw new Error('Kateqoriya və ya məktəb ID-si çatışmır');
    }

    console.log(`Fetching data entries for category ${categoryId} and school ${schoolId}`);
    
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

    if (!data) {
      console.log('No data entries found');
      return [];
    }

    const safeEntries = data.map(entry => ({
      ...entry,
      value: entry.value !== undefined && entry.value !== null ? entry.value : '',
      status: entry.status || 'draft' // string kimi istifadə
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
 */
export async function saveDataEntries(
  entries: Partial<DataEntry>[],
  categoryId: string,
  schoolId: string,
  userId?: string | null
): Promise<DataEntry[]> {
  try {
    if (!categoryId || !schoolId) {
      throw new Error('Kateqoriya və ya məktəb ID-si çatışmır');
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('Saxlanılacaq məlumat yoxdur');
    }

    console.log('About to save data entries:', { categoryId, schoolId, entriesCount: entries.length, userId });
    
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
      if (!entry.column_id) {
        console.warn('Entry without column_id found:', entry);
        throw new Error('Sütun ID-si olmayan məlumat daxil etməsi');
      }
      
      // UUID validation və safe handling - daha güclü yoxlama
      let safeUserId: string | null = null;
      
      // Əgər userId mövcuddursa və etibarlıdırsa
      if (userId) {
        console.log('Validating userId:', userId, 'Type:', typeof userId);
        
        // "system" stringini rədd edirik
        if (userId === 'system' || userId === 'null' || userId === 'undefined') {
          console.warn('Invalid userId detected, setting to null:', userId);
          safeUserId = null;
        } else {
          // UUID formatını yoxlayırıq
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(userId.toString())) {
            safeUserId = userId;
            console.log('Valid UUID detected:', safeUserId);
          } else {
            console.warn('Invalid UUID format, setting to null:', userId);
            safeUserId = null;
          }
        }
      } else {
        console.log('No userId provided, using null');
        safeUserId = null;
      }
      
      const processedEntry = {
        column_id: entry.column_id,
        category_id: categoryId,
        school_id: schoolId,
        value: entry.value ?? '',
        status: entry.status || 'draft', // string kimi istifadə
        created_by: safeUserId, // Safe UUID handling
        created_at: new Date().toISOString(), // ✅ ƏLAVƏ EDİLDİ
        updated_at: new Date().toISOString()
      };

      const existingId = existingMap.get(entry.column_id);
      
      if (existingId) {
        entriesToUpdate.push({ ...processedEntry, id: existingId });
      } else {
        entriesToInsert.push(processedEntry);
      }
    });

    const results: DataEntry[] = [];

    // INSERT əməliyyatları
    if (entriesToInsert.length > 0) {
      console.log('Entries to insert:', JSON.stringify(entriesToInsert, null, 2));
      console.log('User ID for insert operation:', userId);
      
      // .insert() metodunu düzgün istifadə et
      const { data: insertedData, error: insertError } = await supabase
        .from('data_entries')
        .insert(entriesToInsert) // burada columns parametri olmamalıdır
        .select(); // .select('*') əvəzinə sadəcə .select() istifadə et

      if (insertError) {
        console.error('Error inserting data entries:', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          entriesToInsert: entriesToInsert.map(entry => ({
            ...entry,
            created_by: entry.created_by || 'NULL' // NULL göstərmək üçün
          }))
        });
        
        // UUID xətaları üçün xüsusi mesaj
        if (insertError.code === '22P02' && insertError.message?.includes('uuid')) {
          console.error('UUID format error detected. This usually means a non-UUID value was passed to a UUID column.');
          console.error('Check the created_by field values:', entriesToInsert.map(e => e.created_by));
        }
        
        throw insertError;
      }

      if (insertedData) {
        console.log('Successfully inserted:', insertedData.length, 'entries');
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
 */
export async function updateDataEntriesStatus(
  entries: DataEntry[],
  status: string
): Promise<void> {
  try {
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('Yenilənəcək məlumat yoxdur');
    }

    const entryIds = entries.map(entry => entry.id).filter(Boolean);
    
    if (entryIds.length === 0) {
      throw new Error('Etibarlı ID-ləri olan məlumat daxil etmələri tapılmadı');
    }

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
