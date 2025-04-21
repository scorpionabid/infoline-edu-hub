
import { supabase } from '@/integrations/supabase/client';
import { DataEntrySaveStatus } from '@/types/dataEntry';
import { toast } from 'sonner';

export function useDataEntrySave(
  formData: any,
  schoolId?: string,
  categoryId?: string,
  user?: any,
  loadDataForSchool?: (schoolId: string) => Promise<void>,
  t?: (key: string) => string,
  onComplete?: () => void
) {
  const handleSave = async (
    setSaveStatus: (status: DataEntrySaveStatus) => void,
    setIsDataModified: (mod: boolean) => void
  ) => {
    try {
      setSaveStatus(DataEntrySaveStatus.SAVING);

      if (!schoolId || !categoryId) {
        throw new Error('School ID or Category ID is missing');
      }

      if (!Array.isArray(formData.entries)) {
        throw new Error('Entries must be an array');
      }

      for (const entry of formData.entries) {
        if (entry.id) {
          const { error } = await supabase
            .from('data_entries')
            .update({
              value: entry.value,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('data_entries')
            .insert({
              school_id: schoolId,
              category_id: categoryId,
              column_id: entry.column_id,
              value: entry.value,
              status: 'draft',
              created_by: user?.id
            });

          if (error) throw error;
        }
      }

      setIsDataModified(false);
      setSaveStatus(DataEntrySaveStatus.SAVED);

      if (toast && t) {
        toast.success?.(t('dataSavedSuccessfully'));
      }

      if (loadDataForSchool) {
        await loadDataForSchool(schoolId);
      }
    } catch (err: any) {
      setSaveStatus(DataEntrySaveStatus.ERROR);
      if (toast && t) {
        toast.error?.(err.message || t('errorSavingData'));
      }
    }
  };

  const handleSubmitForApproval = async (
    handleSaveFunc: any,
    setSubmitting: (b: boolean) => void
  ) => {
    try {
      setSubmitting(true);
      await handleSaveFunc();

      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) throw error;

      if (toast && t) {
        toast.success?.(t('dataSubmittedForApproval'));
      }

      if (onComplete) onComplete();
    } catch (err: any) {
      if (toast && t) {
        toast.error?.(err.message || t('errorSubmittingData'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    handleSave,
    handleSubmitForApproval
  };
}
