import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Report } from '@/types/report';
import { toast } from 'sonner';

export const useReports = () => {
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Hesabatları əldə etmə
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as Report[];
      } catch (error) {
        console.error('Hesabatlar yüklənərkən xəta baş verdi:', error);
        throw error;
      }
    }
  });

  // Hesabat əlavə etmə
  const addReport = async (newReport: Partial<Report>) => {
    setLoading(true);
    try {
      // Supabase-ə hesabatı əlavə etmək üçün funksiya burada olacaq
      // Hal-hazırda demo məqsədi ilə mock data yaradırıq
      const mockReport: Report = {
        id: `report-${Date.now()}`,
        title: newReport.title || 'Yeni hesabat',
        description: newReport.description || '',
        type: newReport.type || 'custom',
        status: newReport.status || 'draft',
        content: newReport.content || {},
        created_at: new Date().toISOString(),
        filters: newReport.filters || {}
      };
      
      return mockReport;
    } catch (error) {
      console.error('Hesabat əlavə edilərkən xəta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hesabatı yeniləmə
  const updateReport = async (id: string, updates: Partial<Report>) => {
    setLoading(true);
    try {
      // Supabase-də hesabat yeniləmə funksiyası burada olacaq
      return { id, ...updates };
    } catch (error) {
      console.error('Hesabat yenilənərkən xəta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hesabat silmə
  const deleteReport = async (id: string) => {
    setLoading(true);
    try {
      // Supabase-dən hesabat silmə funksiyası burada olacaq
      return id;
    } catch (error) {
      console.error('Hesabat silinərkən xəta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    reports: reports || [],
    templates,
    loading: isLoading || loading,
    error,
    addReport,
    updateReport,
    deleteReport
  };
};
