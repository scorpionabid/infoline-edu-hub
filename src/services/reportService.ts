import { StatusFilterOptions, Report, SchoolColumnData, ExportOptions } from '@/types/report';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Reports
export const fetchReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Report[];
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
    return data as Report;
  } catch (error) {
    throw handleError(error);
  }
};

export const createReport = async (report: Partial<Report>): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single();
    
    if (error) throw error;
    return data as Report;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateReport = async (reportId: string, updates: Partial<Report>): Promise<Report> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Report;
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
    const reportWithTemplate = {
      ...template,
      is_template: true,
      status: 'published'
    };
    
    const { data, error } = await supabase
      .from('reports')
      .insert([reportWithTemplate])
      .select()
      .single();
    
    if (error) throw error;
    return data as Report;
  } catch (error) {
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
