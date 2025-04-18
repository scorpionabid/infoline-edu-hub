
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportType } from '@/types/report';
import { 
  getReportTableName, 
  getReportTemplateTableName, 
  mapReportTableToReport, 
  mapTemplateTableToReport, 
  handleReportError 
} from './reportBaseService';
import { TableNames } from '@/types/db';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Hesabat və şablonları əldə etmək
export const getReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from(TableNames.REPORTS)
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
      .from(TableNames.REPORTS)
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
      .from(TableNames.REPORT_TEMPLATES)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (templateError) throw templateError;
    
    // Sonra əsas cədvəldən template kimi işarələnmiş hesabatları əldə edək
    const { data: reportData, error: reportError } = await supabase
      .from(TableNames.REPORTS)
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
      .from(TableNames.REPORTS)
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
      .from(TableNames.REPORTS)
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
      .from(TableNames.REPORTS)
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

// Hesabat əlavə et, yenilə və sil
export const addReport = async (report: Partial<Report>): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from(TableNames.REPORTS)
      .insert([
        {
          title: report.title || 'Yeni hesabat',
          description: report.description || '',
          type: report.type || 'custom',
          status: report.status || 'draft',
          content: report.content || {},
          filters: report.filters || {},
          created_by: report.createdBy || null,
          is_template: report.isTemplate || false,
          shared_with: report.sharedWith || [],
          insights: report.insights || [],
          recommendations: report.recommendations || []
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return mapReportTableToReport(data);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const updateReport = async (id: string, updates: Partial<Report>): Promise<Report> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.filters !== undefined) dbUpdates.filters = updates.filters;
    if (updates.isTemplate !== undefined) dbUpdates.is_template = updates.isTemplate;
    if (updates.sharedWith !== undefined) dbUpdates.shared_with = updates.sharedWith;
    if (updates.insights !== undefined) dbUpdates.insights = updates.insights;
    if (updates.recommendations !== undefined) dbUpdates.recommendations = updates.recommendations;
    
    // Yenilənmə tarixini avtomatik əlavə et
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TableNames.REPORTS)
      .update(dbUpdates)
      .eq('id', id)
      .select()
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
    return false;
  }
};

// Hesabat paylaşma
export const shareReportWithUsers = async (reportId: string, userIds: string[]): Promise<boolean> => {
  try {
    // Əvvəlcə hesabatın mövcud shared_with siyahısını alaq
    const { data, error: fetchError } = await supabase
      .from(TableNames.REPORTS)
      .select('shared_with')
      .eq('id', reportId)
      .single();

    if (fetchError) throw fetchError;

    // Mövcud paylaşılanlar siyahısını alaq
    let sharedWith = Array.isArray(data.shared_with) ? data.shared_with : [];

    // Yeni istifadəçiləri əlavə edək
    userIds.forEach(userId => {
      if (!sharedWith.includes(userId)) {
        sharedWith.push(userId);
      }
    });

    // Hesabatı yeniləyək
    const { error: updateError } = await supabase
      .from(TableNames.REPORTS)
      .update({ shared_with: sharedWith })
      .eq('id', reportId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    throw handleReportError(error);
    return false;
  }
};

// Hesabat ixrac funksiyaları
export const exportReportToExcel = async (report: Report): Promise<void> => {
  try {
    // Hesabatdan məlumatları alırıq
    const reportData = report.content || {};
    
    // Excel üçün data array yaradırıq
    const worksheetData: any[] = [];
    
    // Əgər report content-də data array varsa, onu işlədirik
    if (reportData && reportData.data && Array.isArray(reportData.data)) {
      // Başlıqlar üçün ilk sətir
      if (reportData.columns && Array.isArray(reportData.columns)) {
        const headers = reportData.columns.map((col: any) => col.title || col.name);
        worksheetData.push(headers);
      }
      
      // Məlumat sətirləri
      reportData.data.forEach((row: any) => {
        const rowData = reportData.columns.map((col: any) => {
          const key = col.key || col.name;
          return row[key] || '';
        });
        worksheetData.push(rowData);
      });
    } else {
      // Əgər data formatı fərqlidirsə, sadəcə JSON-u flatlayırıq
      worksheetData.push(['Açar', 'Dəyər']);
      Object.entries(reportData || {}).forEach(([key, value]) => {
        worksheetData.push([key, JSON.stringify(value)]);
      });
    }
    
    // Worksheet yaradırıq
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Workbook yaradırıq və worksheet əlavə edirik
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Excel faylını yaradırıq
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Faylı yükləyirik
    saveAs(fileData, `${report.title || 'Report'}-${new Date().toISOString()}.xlsx`);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const exportReportToPDF = async (report: Report): Promise<string> => {
  try {
    // PDF ixracı üçün funksionallıq
    // Hələlik Excel ixracını istifadə edək
    await exportReportToExcel(report);
    return `${report.title || 'Report'}-${report.id}.pdf`;
  } catch (error) {
    throw handleReportError(error);
    return null;
  }
};

export const exportReportToCSV = async (report: Report): Promise<string> => {
  try {
    // CSV ixracı üçün funksionallıq
    // Hələlik Excel ixracını istifadə edək
    await exportReportToExcel(report);
    return `${report.title || 'Report'}-${report.id}.csv`;
  } catch (error) {
    throw handleReportError(error);
    return null;
  }
};
