
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdvancedReportConfig {
  id?: string;
  name: string;
  type: string;
  filters: Record<string, any>;
  columns: string[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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

  const generateReport = useCallback(async (config: AdvancedReportConfig) => {
    setIsGenerating(true);
    try {
      // Basic report generation logic
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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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

  return {
    reportTemplates,
    isLoadingTemplates,
    isGenerating,
    generateReport,
    saveTemplate: saveTemplate.mutate,
    isSavingTemplate: saveTemplate.isPending
  };
};
