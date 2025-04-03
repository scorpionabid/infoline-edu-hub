
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useExternalReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // Use a PostgreSQL function to get reports from another schema/table
      const { data, error } = await supabase.rpc('get_reports');
      
      if (error) throw new Error(error.message);
      
      if (data && Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const generateReport = useCallback(async (params: {
    reportType: string;
    regionId?: string;
    sectorId?: string;
    schoolId?: string;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }) => {
    setLoading(true);
    try {
      // Use a PostgreSQL function to generate a report
      const { data, error } = await supabase.rpc('generate_report', params);
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    generateReport
  };
};

export default useExternalReports;
