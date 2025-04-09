
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
    return (data as ReportTable[]).map(report => ({
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
      recommendations: report.content?.recommendations || [],
      downloadUrl: `/api/reports/download/${report.id}`,
      summary: report.content?.summary || '',
      tags: report.tags || []
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
    return (data as ReportTemplateTable[]).map(template => ({
      id: template.id,
      name: template.name,
      title: template.name,
      description: template.description || '',
      type: template.type as ReportType,
      createdAt: template.created_at,
      status: 'published' as 'draft' | 'published' | 'archived', // Şablonlar nəşr olunmuş kimi göstərilir
      createdBy: template.created_by || '',
      tags: template.tags || []
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
    const reportData = data as ReportTable;
    // JSON kontentini düzgün işləyirik
    const content = typeof reportData.content === 'string' 
      ? JSON.parse(reportData.content) 
      : reportData.content || {};
      
    return {
      id: reportData.id,
      name: reportData.title,
      title: reportData.title,
      description: reportData.description || '',
      type: reportData.type as ReportType,
      createdAt: reportData.created_at,
      status: reportData.status as 'draft' | 'published' | 'archived',
      createdBy: reportData.created_by || '',
      data: content.data || [],
      insights: content.insights || [],
      recommendations: content.recommendations || [],
      summary: content.summary || '',
      downloadUrl: `/api/reports/download/${reportData.id}`,
      tags: reportData.tags || []
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
    const templateData = data as ReportTemplateTable;
    return {
      id: templateData.id,
      name: templateData.name,
      title: templateData.name,
      description: templateData.description || '',
      type: templateData.type as ReportType,
      createdAt: templateData.created_at,
      status: 'published' as 'draft' | 'published' | 'archived',
      createdBy: templateData.created_by || '',
      tags: templateData.tags || []
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

/**
 * PDF formatında hesabat ixrac etmək üçün servis
 */
export const exportReportAsPdf = async (reportId: string): Promise<string | null> => {
  try {
    // Burada hesabatı PDF olaraq ixrac etmə məntiqi əlavə ediləcək
    // Gələcəkdə tətbiq ediləcək
    
    // Test üçün eyni linki qaytarırıq
    return `/api/reports/download/${reportId}?format=pdf`;
  } catch (error: any) {
    console.error('Hesabat PDF formatında ixrac edilərkən xəta baş verdi:', error);
    toast.error('Hesabat PDF formatında ixrac edilərkən xəta baş verdi');
    return null;
  }
};

/**
 * CSV formatında hesabat ixrac etmək üçün servis
 */
export const exportReportAsCsv = async (reportId: string): Promise<string | null> => {
  try {
    // Burada hesabatı CSV olaraq ixrac etmə məntiqi əlavə ediləcək
    // Gələcəkdə tətbiq ediləcək
    
    // Test üçün eyni linki qaytarırıq
    return `/api/reports/download/${reportId}?format=csv`;
  } catch (error: any) {
    console.error('Hesabat CSV formatında ixrac edilərkən xəta baş verdi:', error);
    toast.error('Hesabat CSV formatında ixrac edilərkən xəta baş verdi');
    return null;
  }
};

/**
 * Hesabatı paylaşmaq üçün servis
 */
export const shareReport = async (reportId: string, userIds: string[]): Promise<boolean> => {
  try {
    // Hesabatı əldə et
    const { data: report, error: reportError } = await supabase
      .from(TableNames.REPORTS)
      .select('shared_with')
      .eq('id', reportId)
      .single();
      
    if (reportError) throw reportError;
    
    // Paylaşım siyahısını yenilə
    let sharedWith = Array.isArray(report.shared_with) ? report.shared_with : [];
    
    // Yeni istifadəçiləri əlavə et (təkrarları silərək)
    const newSharedWith = [...new Set([...sharedWith, ...userIds])];
    
    // Yeniləməni göndər
    const { error: updateError } = await supabase
      .from(TableNames.REPORTS)
      .update({
        shared_with: newSharedWith
      })
      .eq('id', reportId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error: any) {
    console.error('Hesabat paylaşılarkən xəta baş verdi:', error);
    toast.error('Hesabat paylaşılarkən xəta baş verdi');
    return false;
  }
};
