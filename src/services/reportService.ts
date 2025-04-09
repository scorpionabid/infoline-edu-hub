
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportType, SchoolColumnData, StatusFilterOptions } from '@/types/report';
import { ReportTable, ReportTemplateTable, TableNames } from '@/types/db';
import { toast } from 'sonner';

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
    return (data as unknown as ReportTable[]).map(report => ({
      id: report.id,
      name: report.title,
      title: report.title,
      description: report.description || '',
      type: report.type as ReportType,
      createdAt: report.created_at,
      lastUpdated: report.updated_at,
      status: report.status as 'draft' | 'published' | 'archived',
      createdBy: report.created_by || '',
      data: report.content?.data || [],
      insights: report.content?.insights || [],
      recommendations: report.content?.recommendations || []
    }));
  } catch (error: any) {
    console.error('Hesabatlar yüklənərkən xəta baş verdi:', error);
    toast.error('Hesabatlar yüklənərkən xəta baş verdi');
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
    return (data as unknown as ReportTemplateTable[]).map(template => ({
      id: template.id,
      name: template.name,
      title: template.name,
      description: template.description || '',
      type: template.type as ReportType,
      createdAt: template.created_at,
      status: 'published' as 'draft' | 'published' | 'archived', // Şablonlar nəşr olunmuş kimi göstərilir
      createdBy: template.created_by || ''
    }));
  } catch (error: any) {
    console.error('Hesabat şablonları yüklənərkən xəta baş verdi:', error);
    toast.error('Hesabat şablonları yüklənərkən xəta baş verdi');
    return [];
  }
};

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
          recommendations: report.recommendations || []
        },
        status: report.status || 'draft',
        created_by: report.createdBy
      }])
      .select()
      .single();

    if (error) throw error;

    // Type assertion ilə düzgün tipə çeviririk
    const reportData = data as unknown as ReportTable;
    return {
      id: reportData.id,
      name: reportData.title,
      title: reportData.title,
      description: reportData.description || '',
      type: reportData.type as ReportType,
      createdAt: reportData.created_at,
      status: reportData.status as 'draft' | 'published' | 'archived',
      createdBy: reportData.created_by || '',
      data: reportData.content?.data || [],
      insights: reportData.content?.insights || [],
      recommendations: reportData.content?.recommendations || []
    };
  } catch (error: any) {
    console.error('Hesabat yaradılarkən xəta baş verdi:', error);
    toast.error('Hesabat yaradılarkən xəta baş verdi');
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
    
    // Content yeniləmək
    if (report.data || report.insights || report.recommendations) {
      // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
      const { data: existingReport, error } = await supabase
        .from(TableNames.REPORTS)
        .select('content')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const content = existingReport?.content || {};
      
      if (report.data) content.data = report.data;
      if (report.insights) content.insights = report.insights;
      if (report.recommendations) content.recommendations = report.recommendations;
      
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
    console.error('Hesabat yenilənərkən xəta baş verdi:', error);
    toast.error('Hesabat yenilənərkən xəta baş verdi');
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
          layout: 'default'
        },
        status: 'active',
        created_by: template.createdBy
      }])
      .select()
      .single();

    if (error) throw error;

    // Type assertion ilə düzgün tipə çeviririk
    const templateData = data as unknown as ReportTemplateTable;
    return {
      id: templateData.id,
      name: templateData.name,
      title: templateData.name,
      description: templateData.description || '',
      type: templateData.type as ReportType,
      createdAt: templateData.created_at,
      status: 'published' as 'draft' | 'published' | 'archived',
      createdBy: templateData.created_by || ''
    };
  } catch (error: any) {
    console.error('Hesabat şablonu yaradılarkən xəta baş verdi:', error);
    toast.error('Hesabat şablonu yaradılarkən xəta baş verdi');
    return null;
  }
};

/**
 * Məktəb sütun məlumatlarını gətirmək üçün servis
 */
export const fetchSchoolColumnData = async (
  categoryId?: string,
  statusFilter?: StatusFilterOptions,
  regionId?: string,
  sectorId?: string
): Promise<SchoolColumnData[]> => {
  try {
    // Burada real məlumatları Supabase-dən gətirəcəyik
    // Bu versiyada bir nümunə ilə işləyirik
    
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
    
    if (!category) return [];
    
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
    const result: SchoolColumnData[] = schools.map(school => {
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
    console.error('Məktəb sütun məlumatları yüklənərkən xəta baş verdi:', error);
    toast.error('Məktəb məlumatları yüklənərkən xəta baş verdi');
    return [];
  }
};

/**
 * Hesabatı ixrac etmək üçün servis
 */
export const exportReport = async (reportId: string): Promise<string | null> => {
  try {
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { data: report, error } = await supabase
      .from(TableNames.REPORTS)
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (error) throw error;
    
    // Burada hesabat ixrac əməliyyatını həyata keçirmək üçün 
    // əlavə məntiq və serverlə əlaqə əlavə edilə bilər
    
    // Bu versiyada sadəcə bir link qaytarırıq
    return `/api/reports/download/${reportId}`;
  } catch (error: any) {
    console.error('Hesabat ixrac edilərkən xəta baş verdi:', error);
    toast.error('Hesabat ixrac edilərkən xəta baş verdi');
    return null;
  }
};
