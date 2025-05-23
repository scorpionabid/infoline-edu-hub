import { useCallback, useState } from 'react';
import { useIndexedData } from '@/hooks/core/useIndexedData';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { DataEntry, DataEntryStatus } from '@/types/core/dataEntry';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface UseDataEntryExampleProps {
  categoryId: string;
  schoolId: string;
}

/**
 * Məlumat daxil etmə forması üçün pilot hook
 * Bu hook, yeni hook strukturu üçün test məqsədi ilə yaradılıb
 * və əsas dataEntry funksionallığını təmin edir
 */
export function useDataEntryExample({ categoryId, schoolId }: UseDataEntryExampleProps) {
  // State idarəetməsi
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Xəta emalı
  const { handleError } = useErrorHandler('DataEntryExample');
  
  // UUID ilə indekslənmiş data
  const { map: entriesMap, getItem: getEntryByColumnId } = useIndexedData(
    entries,
    'column_id'
  );
  
  // Məlumatları yükləmək
  const fetchData = useCallback(async () => {
    if (!categoryId || !schoolId) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Kateqoriya sütunlarını əldə edirik
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });
        
      if (columnsError) {
        throw columnsError;
      }
      
      // 2. Data entries əldə edirik
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
        
      if (entriesError) {
        throw entriesError;
      }
      
      // Sütunları düzgün tipə çeviririk - tipemizi müvəqqəti olaraq kənarlaşdırırıq
      // Bu yalnız test məqsədi üçün edilir və istehsal kodunda daha dəqiq tipliəşdirmə tətbiq edilməlidir
      const typedColumns = (columnsData || []) as unknown as Column[];
      
      // State-i yeniləyirik
      setColumns(typedColumns);
      setEntries(entriesData || []);
      
    } catch (error) {
      handleError(error, 'Məlumatları yükləyərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId, handleError]);
  
  // Bir məlumatı yeniləmək
  const updateEntry = useCallback(async (columnId: string, value: any) => {
    if (!categoryId || !schoolId) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const existingEntry = getEntryByColumnId(columnId);
      
      if (existingEntry) {
        // Mövcud entry-ni yeniləyirik
        const { error } = await supabase
          .from('data_entries')
          .update({
            value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
          
        if (error) throw error;
      } else {
        // Yeni entry yaradırıq
        const { error } = await supabase
          .from('data_entries')
          .insert({
            column_id: columnId,
            category_id: categoryId,
            school_id: schoolId,
            value,
            status: DataEntryStatus.DRAFT,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      // Yenidən məlumatları yükləyirik
      await fetchData();
      toast.success('Məlumat uğurla yeniləndi');
      
    } catch (error) {
      handleError(error, 'Məlumatı yeniləyərkən xəta baş verdi');
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, getEntryByColumnId, fetchData, handleError]);
  
  // Tamamlanma faizini hesablayırıq
  const completionPercentage = columns.length 
    ? Math.round((Object.keys(entriesMap).length / columns.length) * 100)
    : 0;
  
  // İstifadəçi interfeysi üçün hook-un nəticələrini qaytarırıq
  return {
    entries,
    entriesMap,
    columns,
    isLoading,
    isSaving,
    getEntryByColumnId,
    fetchData,
    updateEntry,
    completionPercentage
  };
}

export default useDataEntryExample;
