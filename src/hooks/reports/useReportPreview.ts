
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import { toast } from 'sonner';

export const useReportPreview = (reportId: string) => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        // Convert the Supabase data format to our Report type
        if (data) {
          const reportData: Report = {
            id: data.id,
            title: data.title,
            description: data.description,
            type: data.type as any,
            content: data.content,
            filters: data.filters,
            status: data.status,
            created_at: data.created_at,
            created_by: data.created_by,
            updated_at: data.updated_at,
            insights: data.insights || [],
            recommendations: data.recommendations || [],
            is_template: data.is_template || false,
            shared_with: data.shared_with || []
          };
          setReport(reportData);
        }
      } catch (err: any) {
        console.error('Error fetching report:', err);
        setError(err.message);
        toast.error('Error loading report', {
          description: err.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  return { report, loading, error };
};

export default useReportPreview;
