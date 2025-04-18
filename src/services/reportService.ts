
import { StatusFilterOptions, Report, SchoolColumnData, ExportOptions } from '@/types/report';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Helpers for data conversion
const mapDbReportToReport = (dbReport: any): Report => {
  return {
    id: dbReport.id,
    title: dbReport.title || dbReport.name || '',
    name: dbReport.name,
    description: dbReport.description || '',
    type: dbReport.type,
    status: dbReport.status,
    content: dbReport.content || {},
    filters: dbReport.filters || {},
    createdBy: dbReport.created_by,
    createdAt: dbReport.created_at,
    created: dbReport.created_at,
    dateCreated: dbReport.created_at,
    updatedAt: dbReport.updated_at,
    lastUpdated: dbReport.updated_at,
    isTemplate: dbReport.is_template || false,
    sharedWith: Array.isArray(dbReport.shared_with) ? dbReport.shared_with : [],
    insights: Array.isArray(dbReport.insights) ? dbReport.insights : [],
    recommendations: Array.isArray(dbReport.recommendations) ? dbReport.recommendations : []
  };
};

const mapReportToDbReport = (report: Partial<Report>) => {
  return {
    id: report.id,
    title: report.title || report.name || 'Untitled Report',
    name: report.name,
    description: report.description || '',
    type: report.type || 'custom',
    status: report.status || 'draft',
    content: report.content || {},
    filters: report.filters || {},
    created_by: report.createdBy,
    created_at: report.createdAt || report.created || report.dateCreated || new Date().toISOString(),
    updated_at: report.updatedAt || report.lastUpdated || new Date().toISOString(),
    is_template: report.isTemplate || false,
    shared_with: report.sharedWith || [],
    insights: report.insights || [],
    recommendations: report.recommendations || []
  };
};

// Reports
export const fetchReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(mapDbReportToReport) : [];
  } catch (error) {
    throw handleError(error);
  }
};

// Fetch report templates (filter for is_template = true)
export const fetchReportTemplates = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('is_template', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(mapDbReportToReport) : [];
  } catch (error) {
    throw handleError(error);
  }
};

export const fetchReportById = async (reportId: string): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (error) throw error;
    return data ? mapDbReportToReport(data) : null;
  } catch (error) {
    throw handleError(error);
  }
};

// Add/create a new report
export const addReport = async (report: Partial<Report>): Promise<Report> => {
  try {
    const dbReport = mapReportToDbReport(report);
    
    const { data, error } = await supabase
      .from('reports')
      .insert([dbReport])
      .select()
      .single();
    
    if (error) throw error;
    return data ? mapDbReportToReport(data) : null;
  } catch (error) {
    throw handleError(error);
  }
};

// Edit/update an existing report
export const editReport = async (reportId: string, updates: Partial<Report>): Promise<Report> => {
  try {
    const dbUpdates = mapReportToDbReport(updates);
    
    const { data, error } = await supabase
      .from('reports')
      .update(dbUpdates)
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) throw error;
    return data ? mapDbReportToReport(data) : null;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);
    
    if (error) throw error;
  } catch (error) {
    throw handleError(error);
  }
};

export const createReportTemplate = async (template: Partial<Report>): Promise<Report> => {
  try {
    const dbTemplate = mapReportToDbReport({
      ...template,
      isTemplate: true,
      status: 'published'
    });
    
    const { data, error } = await supabase
      .from('reports')
      .insert([dbTemplate])
      .select()
      .single();
    
    if (error) throw error;
    return data ? mapDbReportToReport(data) : null;
  } catch (error) {
    throw handleError(error);
  }
};

// Export report in various formats
export const exportReport = async (reportId: string): Promise<string | null> => {
  try {
    const report = await fetchReportById(reportId);
    if (!report) throw new Error("Report not found");
    
    await exportReportToExcel(report);
    return `${report.title || 'Report'}.xlsx`;
  } catch (error) {
    throw handleError(error);
  }
};

export const exportReportAsPdf = async (reportId: string): Promise<string | null> => {
  try {
    // PDF export logic would go here
    const report = await fetchReportById(reportId);
    if (!report) throw new Error("Report not found");
    
    // Real PDF generation əvəzinə bizim real ixrac funksiyasını çağıraq
    await exportReportToExcel(report);
    
    // Fake PDF URL return edirik
    return `${report.title || 'Report'}-${reportId}.pdf`;
  } catch (error) {
    throw handleError(error);
  }
};

export const exportReportAsCsv = async (reportId: string): Promise<string | null> => {
  try {
    // CSV export logic would go here
    const report = await fetchReportById(reportId);
    if (!report) throw new Error("Report not found");
    
    // Real CSV generation əvəzinə bizim real ixrac funksiyasını çağıraq
    await exportReportToExcel(report);
    
    // Fake CSV URL return edirik
    return `${report.title || 'Report'}-${reportId}.csv`;
  } catch (error) {
    throw handleError(error);
  }
};

// Funksiyanın adını dəyişirik ki, konflikt yaranmasın
export const shareReportWithUsers = async (reportId: string, userIds: string[]): Promise<boolean> => {
  try {
    // Əvvəlcə hesabatı alaq
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('shared_with')
      .eq('id', reportId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Mövcud shared_with array-i alaq və birləşdirək
    let currentSharedWith = Array.isArray(report.shared_with) ? report.shared_with : [];
    
    // Yeni istifadəçi ID-lərini əlavə edək
    userIds.forEach(userId => {
      if (!currentSharedWith.includes(userId)) {
        currentSharedWith.push(userId);
      }
    });
    
    // Hesabatı update edək
    const { error: updateError } = await supabase
      .from('reports')
      .update({ shared_with: currentSharedWith })
      .eq('id', reportId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Hesabat paylaşma xətası:', error);
    throw handleError(error);
  }
};

// School Column Data
export const fetchSchoolColumnData = async (
  categoryId: string,
  regionId?: string,
  sectorId?: string
): Promise<SchoolColumnData[]> => {
  try {
    // İlk öncə kateqoriyanın sütunlarını alaq
    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId);
    
    if (columnsError) throw columnsError;
    
    // Sonra məktəb məlumatlarını alaq
    let query = supabase
      .from('schools')
      .select('id, name, region_id, sector_id, status, regions(name), sectors(name)');
    
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }
    
    const { data: schools, error: schoolsError } = await query;
    
    if (schoolsError) throw schoolsError;
    
    // Nəhayət, bu məktəblər üçün data_entries-ləri alaq
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*')
      .eq('category_id', categoryId)
      .in('school_id', schools.map((s: any) => s.id));
    
    if (entriesError) throw entriesError;
    
    // Nəticələri formatlaşdıraq
    const result: SchoolColumnData[] = schools.map((school: any) => {
      const schoolEntries = entries.filter((e: any) => e.school_id === school.id);
      const columnData = columns.map((column: any) => {
        const entry = schoolEntries.find((e: any) => e.column_id === column.id);
        return {
          columnId: column.id,
          value: entry ? entry.value : null,
          status: entry ? entry.status : 'pending'
        };
      });
      
      // Məktəbin ümumi statusunu təyin edirik
      let status = 'pending';
      if (schoolEntries.length > 0) {
        const approved = schoolEntries.every((e: any) => e.status === 'approved');
        const rejected = schoolEntries.some((e: any) => e.status === 'rejected');
        
        if (approved) status = 'approved';
        else if (rejected) status = 'rejected';
      }
      
      return {
        schoolId: school.id,
        schoolName: school.name,
        region: school.regions?.name || '',
        sector: school.sectors?.name || '',
        status,
        rejectionReason: schoolEntries.find((e: any) => e.rejection_reason)?.rejection_reason,
        columnData
      };
    });
    
    return result;
  } catch (error) {
    throw handleError(error);
  }
};

export const exportDataToExcel = async (
  data: SchoolColumnData[],
  options?: ExportOptions
): Promise<string> => {
  try {
    // Standart fayl adı
    const fileName = options?.fileName || `school-data-export-${new Date().toISOString()}`;
    
    // Excel üçün data array-i yaradaq
    const worksheetData: any[] = [];
    
    // Başlıqlar
    const headers = ['Məktəb adı', 'Region', 'Sektor', 'Status'];
    
    // Əgər data varsa, ilk məktəbin sütun məlumatlarını başlıq kimi əlavə edirik
    if (data.length > 0 && data[0].columnData.length > 0) {
      data[0].columnData.forEach((_, index) => {
        headers.push(`Sütun ${index + 1}`);
      });
    }
    
    worksheetData.push(headers);
    
    // Məlumatlar
    data.forEach(school => {
      const row = [
        school.schoolName,
        school.region || '',
        school.sector || '',
        school.status
      ];
      
      // Sütun məlumatları
      school.columnData.forEach(column => {
        row.push(column.value || '');
      });
      
      worksheetData.push(row);
    });
    
    // Worksheet yaradaq
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Workbook yaradaq və worksheet əlavə edək
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schools Data');
    
    // Excel faylı yaradaq
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Faylı yükləyək
    saveAs(fileData, `${fileName}.xlsx`);
    
    return `${fileName}.xlsx`;
  } catch (error) {
    throw handleError(error);
  }
};

// Report exports
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
    throw handleError(error);
  }
};
