
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry, DataEntryForm, EntryValue, DataEntryStatus } from '@/types/dataEntry';
import { toast } from 'sonner';

export interface UseFormActionsProps {
  categoryId: string;
  schoolId: string;
  categories: any[];
}

export const useFormActions = ({ categoryId, schoolId, categories }: UseFormActionsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<DataEntryForm>({
    categoryId,
    schoolId,
    entries: [],
    isModified: false,
  });

  const loadEntries = useCallback(async () => {
    if (!categoryId || !schoolId) return;

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);

      if (error) throw error;

      // Convert from DB format to form format
      const formattedEntries: EntryValue[] = (data || []).map(entry => ({
        id: entry.id,
        columnId: entry.column_id,
        value: entry.value,
        status: entry.status
      }));

      setForm(prev => ({
        ...prev,
        entries: formattedEntries,
        isModified: false
      }));

    } catch (err) {
      console.error('Error loading entries:', err);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    }
  }, [categoryId, schoolId]);

  const saveEntries = useCallback(async (status: DataEntryStatus = 'draft') => {
    if (!form.entries.length) return false;
    
    setIsSubmitting(true);
    
    try {
      // Convert form entries to DB format
      const dbEntries = form.entries.map(entry => ({
        column_id: entry.columnId,
        category_id: categoryId,
        school_id: schoolId,
        value: entry.value,
        status,
        id: entry.id // Include ID if exists for updates
      }));
      
      // Use upsert to handle both inserts and updates
      const { error } = await supabase
        .from('data_entries')
        .upsert(dbEntries, { onConflict: 'id' });
      
      if (error) throw error;
      
      setForm(prev => ({
        ...prev,
        isModified: false
      }));
      
      toast.success(status === 'pending' ? 'Məlumatlar təsdiqə göndərildi' : 'Məlumatlar yadda saxlanıldı');
      return true;
    } catch (err) {
      console.error('Error saving entries:', err);
      toast.error('Məlumatlar yadda saxlanılmadı');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form.entries, categoryId, schoolId]);

  const updateEntry = useCallback((columnId: string, value: any) => {
    setForm(prev => {
      const entryIndex = prev.entries.findIndex(e => e.columnId === columnId);
      
      if (entryIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...prev.entries];
        updatedEntries[entryIndex] = { ...updatedEntries[entryIndex], value };
        
        return {
          ...prev,
          entries: updatedEntries,
          isModified: true
        };
      } else {
        // Add new entry
        return {
          ...prev,
          entries: [...prev.entries, { columnId, value }],
          isModified: true
        };
      }
    });
  }, []);

  return {
    form,
    isSubmitting,
    loadEntries,
    saveEntries,
    updateEntry
  };
};
