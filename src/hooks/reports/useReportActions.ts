
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReportActions = () => {
  const [loading, setLoading] = useState(false);
  
  const createReport = useCallback(async (reportData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Report created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating report:', err);
      toast.error('Failed to create report', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateReport = useCallback(async (id: string, reportData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reports')
        .update(reportData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Report updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating report:', err);
      toast.error('Failed to update report', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteReport = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Report deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting report:', err);
      toast.error('Failed to delete report', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    createReport,
    updateReport,
    deleteReport
  };
};

export default useReportActions;
