
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';

export const useReportPreview = (reportId?: string) => {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    if (!reportId) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      // Əgər report mövcuddursa, yaradılma tarixini düzəldirik
      if (data) {
        // createdAt və created_at uyğunlaşdırması
        const processedReport = {
          ...data,
          createdAt: data.created_at || data.createdAt || new Date().toISOString(),
          createdBy: data.created_by || data.createdBy || null
        };
        
        setReport(processedReport as Report);
      }
    } catch (err: any) {
      console.error('Report yüklənməsi xətası:', err);
      setError(err.message || 'Hesabat yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const getReportById = (id: string) => {
    // reportId dəyişdikdə useEffect tapşırığı avtomatik işə salınacaq
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  return {
    report,
    isLoading,
    error,
    fetchReport,
    getReportById
  };
};
