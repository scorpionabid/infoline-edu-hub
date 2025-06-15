
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useDataEntryManager = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitDataEntry = useCallback(async (data: any, userId: string) => {
    setIsSubmitting(true);
    try {
      // Use userId parameter instead of undefined effectiveUserId
      const entryData = {
        ...data,
        created_by: userId,
        status: 'pending'
      };

      const { error } = await supabase
        .from('data_entries')
        .insert([entryData]);

      if (error) throw error;
      
      toast.success('Məlumat uğurla saxlanıldı');
      return true;
    } catch (error) {
      console.error('Error submitting data entry:', error);
      toast.error('Məlumat saxlanılarkən xəta baş verdi');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submitDataEntry,
    isSubmitting
  };
};
