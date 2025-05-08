
import { useState, useCallback } from 'react';
import { DataEntry, DataEntryForm, DataEntrySaveStatus, EntryValue } from '@/types/dataEntry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseFormActionsProps {
  schoolId: string;
  categoryId: string;
  initialEntries?: DataEntry[];
  formData?: any;
  setFormData?: any;
  updateFormData?: any;
  categories?: any[];
}

export const useFormActions = ({ schoolId, categoryId, initialEntries = [] }: UseFormActionsProps) => {
  const [form, setForm] = useState<DataEntryForm>({
    entries: initialEntries,
    isModified: false,
    saveStatus: DataEntrySaveStatus.IDLE,
    error: null,
    schoolId,
    categoryId,
    status: 'draft'
  } as any);

  const updateEntries = useCallback((entries: DataEntry[]) => {
    const entriesWithMetadata = entries.map(entry => ({
      ...entry,
      category_id: entry.category_id || categoryId,
      school_id: entry.school_id || schoolId
    }));

    setForm(prev => ({
      ...prev,
      entries: entriesWithMetadata,
      isModified: true
    }));
  }, [categoryId, schoolId]);

  const saveEntries = useCallback(async () => {
    if (!form.entries.length) return;

    setForm(prev => ({
      ...prev,
      saveStatus: DataEntrySaveStatus.SAVING,
      error: null
    }));

    try {
      const { data, error } = await supabase.from('data_entries').upsert(
        form.entries.map(entry => ({
          id: entry.id,
          column_id: entry.column_id,
          category_id: entry.category_id,
          school_id: entry.school_id,
          value: entry.value,
          status: 'pending'
        })),
        { onConflict: 'id' }
      ).select();

      if (error) throw error;

      setForm(prev => ({
        ...prev,
        entries: data,
        isModified: false,
        saveStatus: DataEntrySaveStatus.SAVED,
        error: null,
        lastSaved: new Date().toISOString()
      }));

      toast.success('Məlumatlar uğurla saxlanıldı');
      return true;
    } catch (err: any) {
      console.error('Error saving entries:', err);
      setForm(prev => ({
        ...prev,
        saveStatus: DataEntrySaveStatus.ERROR,
        error: err.message || 'Məlumatları saxlamaq mümkün olmadı'
      }));
      toast.error('Məlumatları saxlamaq mümkün olmadı');
      return false;
    }
  }, [form.entries]);

  const submitEntries = useCallback(async () => {
    // Əvvəlcə məlumatları saxlayaq
    const savedSuccessfully = await saveEntries();
    if (!savedSuccessfully) return false;

    setForm(prev => ({
      ...prev,
      saveStatus: DataEntrySaveStatus.SUBMITTING,
      error: null,
      submittedAt: new Date().toISOString()
    }));

    try {
      // Statusu "submitted" olaraq yeniləyək
      const { error } = await supabase.from('data_entries').update({
        status: 'submitted'
      }).in('id', form.entries.map(entry => entry.id));

      if (error) throw error;

      setForm(prev => ({
        ...prev,
        saveStatus: DataEntrySaveStatus.SUBMITTED,
        status: 'pending',
        isModified: false,
        error: null
      }));

      toast.success('Məlumatlar uğurla təqdim edildi');
      return true;
    } catch (err: any) {
      console.error('Error submitting entries:', err);
      setForm(prev => ({
        ...prev,
        saveStatus: DataEntrySaveStatus.ERROR,
        error: err.message || 'Məlumatları təqdim etmək mümkün olmadı'
      }));
      toast.error('Məlumatları təqdim etmək mümkün olmadı');
      return false;
    }
  }, [saveEntries, form.entries]);

  const exportToCsv = useCallback(() => {
    // Məlumatları CSV formatına çeviririk
    const entries = form.entries || [];
    const schoolId = form.schoolId || '';
    const categoryId = form.categoryId || '';
    
    // Burada interfeys uyğunlaşdırılması üçün EntryValue[] formatına çeviririk
    // Bu interfeys uyğunlaşdırması və CSV yaratma prosesi
    const entriesData: EntryValue[] = entries.map(entry => ({
      [entry.column_id]: entry.value
    }));

    // CSV başlıqları və məlumatları formatla
    const csvContent = '';
    // CSV'ni brauzer tərəfindən endirmək üçün kodu implement et

    return true;
  }, [form.entries, form.schoolId, form.categoryId]);

  return {
    form,
    updateEntries,
    saveEntries,
    submitEntries,
    exportToCsv,
    resetForm: () => setForm({
      entries: initialEntries,
      isModified: false,
      saveStatus: DataEntrySaveStatus.IDLE,
      error: null,
      schoolId,
      categoryId,
      status: 'draft'
    } as any)
  };
};
