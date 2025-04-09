
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import { TableNames } from '@/types/db';
import { mapReportTableToReport, handleReportError } from './reportBaseService';

/**
 * Hesabat yaratmaq üçün servis
 */
export const createReport = async (report: Partial<Report>): Promise<Report | null> => {
  try {
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { data, error } = await supabase
      .from(TableNames.REPORTS)
      .insert([{
        title: report.name || report.title,
        description: report.description,
        type: report.type,
        content: {
          data: report.data || [],
          insights: report.insights || [],
          recommendations: report.recommendations || [],
          summary: report.summary || ''
        },
        status: report.status || 'draft',
        created_by: report.createdBy,
        tags: report.tags || []
      }])
      .select()
      .single();

    if (error) throw error;

    // Type assertion ilə düzgün tipə çeviririk
    return mapReportTableToReport(data as any);
  } catch (error: any) {
    handleReportError(error, 'Hesabat yaradılarkən xəta baş verdi');
    return null;
  }
};

/**
 * Hesabat yeniləmək üçün servis
 */
export const updateReport = async (id: string, report: Partial<Report>): Promise<boolean> => {
  try {
    const updates: any = {};
    
    if (report.name || report.title) updates.title = report.name || report.title;
    if (report.description !== undefined) updates.description = report.description;
    if (report.status) updates.status = report.status;
    if (report.tags) updates.tags = report.tags;
    
    // Content yeniləmək
    if (report.data || report.insights || report.recommendations || report.summary) {
      // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
      const { data: existingReport, error } = await supabase
        .from(TableNames.REPORTS)
        .select('content')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // JSON kontentini düzgün işləyirik
      let content = typeof existingReport.content === 'string'
        ? JSON.parse(existingReport.content)
        : existingReport.content || {};
        
      if (!content) content = {};
      
      if (report.data) content.data = report.data;
      if (report.insights) content.insights = report.insights;
      if (report.recommendations) content.recommendations = report.recommendations;
      if (report.summary) content.summary = report.summary;
      
      updates.content = content;
    }
    
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { error } = await supabase
      .from(TableNames.REPORTS)
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error: any) {
    handleReportError(error, 'Hesabat yenilənərkən xəta baş verdi');
    return false;
  }
};

/**
 * Hesabat şablonu yaratmaq üçün servis
 */
export const createReportTemplate = async (template: Partial<Report>): Promise<Report | null> => {
  try {
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { data, error } = await supabase
      .from(TableNames.REPORT_TEMPLATES)
      .insert([{
        name: template.name || template.title,
        description: template.description,
        type: template.type,
        config: {
          filters: template.data,
          layout: 'default',
          insights: template.insights || [],
          recommendations: template.recommendations || []
        },
        status: 'active',
        created_by: template.createdBy,
        tags: template.tags || []
      }])
      .select()
      .single();

    if (error) throw error;

    // Type assertion ilə düzgün tipə çeviririk
    return {
      id: data.id,
      name: data.name,
      title: data.name,
      description: data.description || '',
      type: data.type,
      createdAt: data.created_at,
      status: 'published' as 'draft' | 'published' | 'archived',
      createdBy: data.created_by || '',
      tags: data.tags || []
    };
  } catch (error: any) {
    handleReportError(error, 'Hesabat şablonu yaradılarkən xəta baş verdi');
    return null;
  }
};
