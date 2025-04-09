
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import { getReportTableName, mapReportTableToReport, handleReportError } from './reportBaseService';
import { TableNames } from '@/types/db';

export const createReport = async (report: Partial<Report>): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from(TableNames.REPORTS)
      .insert({
        title: report.title,
        description: report.description,
        type: report.type,
        status: report.status || 'draft',
        content: report.content || {},
        filters: report.filters || {},
        created_by: report.createdBy,
        is_template: report.isTemplate || false,
        shared_with: report.sharedWith || [],
        insights: report.insights || [],
        recommendations: report.recommendations || []
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapReportTableToReport(data);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const updateReport = async (id: string, report: Partial<Report>): Promise<Report> => {
  try {
    const updatePayload: any = {};
    
    if (report.title !== undefined) updatePayload.title = report.title;
    if (report.description !== undefined) updatePayload.description = report.description;
    if (report.type !== undefined) updatePayload.type = report.type;
    if (report.status !== undefined) updatePayload.status = report.status;
    if (report.content !== undefined) updatePayload.content = report.content;
    if (report.filters !== undefined) updatePayload.filters = report.filters;
    if (report.isTemplate !== undefined) updatePayload.is_template = report.isTemplate;
    if (report.sharedWith !== undefined) updatePayload.shared_with = report.sharedWith;
    if (report.insights !== undefined) updatePayload.insights = report.insights;
    if (report.recommendations !== undefined) updatePayload.recommendations = report.recommendations;
    
    // Yeniləmə tarixini yeni dəyərə təyin edirik
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TableNames.REPORTS)
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapReportTableToReport(data);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TableNames.REPORTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    throw handleReportError(error);
  }
};
