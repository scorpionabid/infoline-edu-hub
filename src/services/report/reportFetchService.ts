
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import { TableNames } from '@/types/db';
import { mapReportTableToReport, mapTemplateTableToReport, handleReportError } from './reportBaseService';

/**
 * Hesabatları gətirmək üçün servis
 */
export const fetchReports = async (): Promise<Report[]> => {
  try {
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { data, error } = await supabase
      .from(TableNames.REPORTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type assertion ilə düzgün tipə çeviririk
    return (data as any[]).map(report => mapReportTableToReport(report));
  } catch (error: any) {
    handleReportError(error, 'Hesabatlar yüklənərkən xəta baş verdi');
    return [];
  }
};

/**
 * Hesabat şablonlarını gətirmək üçün servis
 */
export const fetchReportTemplates = async (): Promise<Report[]> => {
  try {
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { data, error } = await supabase
      .from(TableNames.REPORT_TEMPLATES)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type assertion ilə düzgün tipə çeviririk
    return (data as any[]).map(template => mapTemplateTableToReport(template));
  } catch (error: any) {
    handleReportError(error, 'Hesabat şablonları yüklənərkən xəta baş verdi');
    return [];
  }
};

/**
 * Məktəb sütun məlumatlarını gətirmək üçün servis
 */
export const fetchSchoolColumnData = async (
  categoryId?: string,
  statusFilter?: any,
  regionId?: string,
  sectorId?: string
): Promise<any[]> => {
  try {
    // Məktəbləri gətirək
    let schoolsQuery = supabase
      .from('schools')
      .select(`
        id,
        name,
        region_id,
        sector_id,
        regions!inner(name),
        sectors!inner(name)
      `);
      
    if (regionId) schoolsQuery = schoolsQuery.eq('region_id', regionId);
    if (sectorId) schoolsQuery = schoolsQuery.eq('sector_id', sectorId);
    
    const { data: schools, error: schoolsError } = await schoolsQuery;
    
    if (schoolsError) throw schoolsError;
    
    if (!schools || schools.length === 0) return [];
    
    // Kateqoriya məlumatlarını gətirək
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        columns(id, name, type, is_required, order_index)
      `)
      .eq('id', categoryId || '')
      .single();
      
    if (categoryError && categoryError.code !== 'PGRST116') throw categoryError;
    
    if (!category) {
      // Demo kateqoriya olmadığı halda test kateqoriyası istifadə edək
      const mockCategory = {
        id: "mock-category",
        name: "Test Kategoriyası",
        columns: [
          { id: "col-1", name: "Şagird sayı", type: "number", is_required: true, order_index: 1 },
          { id: "col-2", name: "Müəllim sayı", type: "number", is_required: true, order_index: 2 },
          { id: "col-3", name: "Otaq sayı", type: "number", is_required: true, order_index: 3 }
        ]
      };
      
      // Demo məlumatlar yaradaq
      return schools.map(school => ({
        schoolId: school.id,
        schoolName: school.name,
        region: school.regions?.name,
        sector: school.sectors?.name,
        status: "pending",
        columnData: mockCategory.columns.map(column => ({
          columnId: column.id,
          value: Math.floor(Math.random() * 1000)
        }))
      }));
    }
    
    // Məlumatları gətirək
    let dataQuery = supabase
      .from('data_entries')
      .select(`
        id,
        school_id,
        column_id,
        value,
        status,
        rejection_reason
      `)
      .eq('category_id', categoryId || '');
      
    // Status filtrini tətbiq edək
    if (statusFilter) {
      const statuses = [];
      if (statusFilter.pending) statuses.push('pending');
      if (statusFilter.approved) statuses.push('approved');
      if (statusFilter.rejected) statuses.push('rejected');
      
      if (statuses.length > 0) {
        dataQuery = dataQuery.in('status', statuses);
      }
    }
    
    const { data: entries, error: entriesError } = await dataQuery;
    
    if (entriesError) throw entriesError;
    
    // Məlumatları birləşdirək
    const result = schools.map(school => {
      const schoolEntries = entries?.filter(entry => entry.school_id === school.id) || [];
      
      const columnData = category.columns.map(column => {
        const entry = schoolEntries.find(e => e.column_id === column.id);
        
        return {
          columnId: column.id,
          value: entry?.value || null
        };
      });
      
      // Sütun məlumatları ilə məktəb məlumatlarını birləşdirək
      return {
        schoolId: school.id,
        schoolName: school.name,
        region: school.regions?.name,
        sector: school.sectors?.name,
        status: schoolEntries.length > 0 ? schoolEntries[0].status : 'pending',
        rejectionReason: schoolEntries.find(e => e.rejection_reason)?.rejection_reason,
        columnData
      };
    });
    
    return result;
  } catch (error: any) {
    handleReportError(error, 'Məktəb sütun məlumatları yüklənərkən xəta baş verdi');
    return [];
  }
};
