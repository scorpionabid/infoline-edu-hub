
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import { 
  getReportTableName, 
  getReportTemplateTableName, 
  mapReportTableToReport, 
  mapTemplateTableToReport, 
  handleReportError 
} from './reportBaseService';

export const getReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from(getReportTableName())
      .select('*')
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportTableToReport);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const getReportById = async (id: string): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from(getReportTableName())
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapReportTableToReport(data);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const getReportTemplates = async (): Promise<Report[]> => {
  try {
    // Əvvəlcə template cədvəlindən şablonları əldə edək
    const { data: templateData, error: templateError } = await supabase
      .from(getReportTemplateTableName())
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (templateError) throw templateError;
    
    // Sonra əsas cədvəldən template kimi işarələnmiş hesabatları əldə edək
    const { data: reportData, error: reportError } = await supabase
      .from(getReportTableName())
      .select('*')
      .eq('is_template', true)
      .order('created_at', { ascending: false });

    if (reportError) throw reportError;
    
    // Hər iki mənbədən gələn məlumatları birləşdirək
    const templates = (templateData || []).map(mapTemplateTableToReport);
    const reportTemplates = (reportData || []).map(mapReportTableToReport);
    
    return [...templates, ...reportTemplates];
  } catch (error) {
    throw handleReportError(error);
  }
};

export const getReportsByType = async (type: string): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from(getReportTableName())
      .select('*')
      .eq('type', type)
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportTableToReport);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const getReportsByUser = async (userId: string): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from(getReportTableName())
      .select('*')
      .eq('created_by', userId)
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportTableToReport);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const getSharedReports = async (userId: string): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from(getReportTableName())
      .select('*')
      .contains('shared_with', [userId])
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReportTableToReport);
  } catch (error) {
    throw handleReportError(error);
  }
};
