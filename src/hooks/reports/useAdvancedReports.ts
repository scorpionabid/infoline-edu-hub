
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { AdvancedReportData, ReportTemplate } from '@/types/advanced-report';

export interface UseAdvancedReportsReturn {
  reports: AdvancedReportData[];
  templates: ReportTemplate[];
  loading: boolean;
  error: string | null;
  generateReport: (type: string, filters?: any) => Promise<AdvancedReportData>;
  saveTemplate: (template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<ReportTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

export const useAdvancedReports = (): UseAdvancedReportsReturn => {
  const { user } = useAuth();
  const [reports, setReports] = useState<AdvancedReportData[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = useCallback((type: string): any[] => {
    // Generate mock data based on report type
    switch (type) {
      case 'performance':
        return [
          { school: 'School A', completion: 85, category: 'Category 1' },
          { school: 'School B', completion: 92, category: 'Category 1' },
          { school: 'School C', completion: 78, category: 'Category 2' }
        ];
      case 'completion':
        return [
          { category: 'Category 1', total: 50, completed: 42 },
          { category: 'Category 2', total: 30, completed: 28 }
        ];
      case 'comparison':
        return [
          { region: 'Region A', performance: 88 },
          { region: 'Region B', performance: 91 }
        ];
      case 'trend':
        return [
          { month: 'Jan', value: 75 },
          { month: 'Feb', value: 80 },
          { month: 'Mar', value: 85 }
        ];
      default:
        return [];
    }
  }, []);

  const generateReport = useCallback(async (type: string, filters: any = {}): Promise<AdvancedReportData> => {
    setLoading(true);
    setError(null);

    try {
      // For now, generate mock data. In production, this would call actual APIs
      const data = generateMockData(type);
      
      const report: AdvancedReportData = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: `Generated ${type} report with filters`,
        type: type as any,
        data,
        filters,
        metadata: {
          totalRecords: data.length,
          dataSource: 'InfoLine System',
          lastUpdated: new Date().toISOString()
        },
        generatedAt: new Date().toISOString(),
        generatedBy: user?.id || 'unknown',
        insights: [
          `Analysis of ${data.length} records shows positive trends`,
          'Data quality is within acceptable parameters'
        ],
        recommendations: [
          'Continue monitoring key metrics',
          'Consider expanding data collection scope'
        ]
      };

      setReports(prev => [report, ...prev.slice(0, 9)]); // Keep last 10 reports
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [generateMockData, user?.id]);

  const loadTemplates = useCallback(async () => {
    try {
      const { data, error: templatesError } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      const validTemplates = (data || []).filter(template => {
        const config = template.config as any;
        return config && typeof config === 'object';
      });

      setTemplates(validTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
      setTemplates([]);
    }
  }, []);

  const saveTemplate = useCallback(async (template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error: saveError } = await supabase
        .from('report_templates')
        .insert([{
          ...template,
          created_by: user?.id || 'unknown'
        }]);

      if (saveError) throw saveError;
      
      await loadTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      throw err;
    }
  }, [user?.id, loadTemplates]);

  const loadTemplate = useCallback(async (templateId: string): Promise<ReportTemplate | null> => {
    try {
      const { data, error: loadError } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (loadError) throw loadError;
      return data;
    } catch (err) {
      console.error('Error loading template:', err);
      return null;
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (deleteError) throw deleteError;
      
      await loadTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      throw err;
    }
  }, [loadTemplates]);

  const refreshReports = useCallback(async () => {
    // In a real implementation, this would reload reports from the database
    // For now, we'll just clear the error state
    setError(null);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    reports,
    templates,
    loading,
    error,
    generateReport,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    refreshReports
  };
};
