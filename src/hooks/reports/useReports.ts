
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportTypeValues } from '@/types/report';
import { toast } from 'sonner';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: {
    title: string;
    description: string;
    type: ReportTypeValues;
  }) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          title: reportData.title,
          description: reportData.description,
          type: reportData.type,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => [data, ...prev]);
      toast.success('Report created successfully');
      return data;
    } catch (err: any) {
      toast.error('Failed to create report');
      throw err;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    createReport,
    refetch: fetchReports
  };
};
