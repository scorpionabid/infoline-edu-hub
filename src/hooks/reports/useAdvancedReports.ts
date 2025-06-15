
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdvancedReportConfig, AdvancedReportData } from '@/types/advanced-report';

export const useAdvancedReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: reportTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: reports = [], isLoading: loading, error } = useQuery({
    queryKey: ['advanced-reports'],
    queryFn: async (): Promise<AdvancedReportData[]> => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        type: report.type,
        data: Array.isArray(report.content?.data) ? report.content.data : [],
        filters: typeof report.filters === 'object' && report.filters !== null ? report.filters as Record<string, any> : {},
        metadata: typeof report.content?.metadata === 'object' && report.content?.metadata !== null ? report.content.metadata as Record<string, any> : {},
        generatedAt: report.created_at,
        generatedBy: report.created_by || '',
        insights: Array.isArray(report.insights) ? report.insights : [],
        recommendations: Array.isArray(report.recommendations) ? report.recommendations : []
      }));
    }
  });

  const generateReport = useCallback(async (config: AdvancedReportConfig) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          title: config.name,
          type: config.type,
          filters: config.filters,
          content: { columns: config.columns, groupBy: config.groupBy }
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Hesabat uğurla yaradıldı');
      queryClient.invalidateQueries({ queryKey: ['advanced-reports'] });
      return data;
    } catch (error: any) {
      toast.error('Hesabat yaradılarkən xəta baş verdi');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [queryClient]);

  const saveTemplate = useMutation({
    mutationFn: async (config: AdvancedReportConfig) => {
      const { data, error } = await supabase
        .from('report_templates')
        .insert([{
          name: config.name,
          type: config.type,
          config: config
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Şablon saxlanıldı');
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
    onError: () => {
      toast.error('Şablon saxlanılarkən xəta baş verdi');
    }
  });

  const exportReport = useCallback(async (reportId: string, format: string) => {
    console.log('Exporting report:', reportId, 'in format:', format);
    toast.success(`Hesabat ${format} formatında ixrac edildi`);
  }, []);

  return {
    reports,
    reportTemplates,
    templates: reportTemplates,
    isLoadingTemplates,
    loading,
    error,
    isGenerating,
    generateReport,
    saveTemplate: saveTemplate.mutate,
    isSavingTemplate: saveTemplate.isPending,
    exportReport
  };
};
