
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/hooks/auth/useUser';

export const useSchoolDataOperations = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleDataSave = async (
    schoolId: string, 
    value: string, 
    selectedCategory: any, 
    selectedColumn: any
  ): Promise<boolean> => {
    try {
      setSaving(true);

      if (!selectedCategory?.id || !selectedColumn?.id) {
        toast.error('Kateqoriya və ya sütun seçilməyib');
        return false;
      }

      console.log('Saving data:', { schoolId, columnId: selectedColumn.id, value });

      // Check if entry exists
      const { data: existingEntry } = await supabase
        .from('school_data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', selectedCategory.id)
        .eq('column_id', selectedColumn.id)
        .single();

      const columnData = { [selectedColumn.id]: value };

      let result;
      if (existingEntry) {
        // Update existing entry
        result = await supabase
          .from('school_data_entries')
          .update({
            column_data: columnData,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      } else {
        // Create new entry
        result = await supabase
          .from('school_data_entries')
          .insert({
            school_id: schoolId,
            category_id: selectedCategory.id,
            column_id: selectedColumn.id,
            column_data: columnData,
            status: 'pending'
          });
      }

      if (result.error) {
        console.error('Save error:', result.error);
        throw result.error;
      }

      console.log('Data saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleDataSave,
    saving
  };
};
