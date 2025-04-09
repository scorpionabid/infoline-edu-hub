
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportType } from '@/types/report';
import { ReportTable, ReportTemplateTable, TableNames } from '@/types/db';
import { toast } from 'sonner';

/**
 * Hesabat cədvəlindən məlumatı Report tipinə çevirmək üçün utilit funksiya
 */
export const mapReportTableToReport = (report: ReportTable): Report => {
  // JSON kontentini düzgün işləyirik
  const content = typeof report.content === 'string' 
    ? JSON.parse(report.content) 
    : report.content || {};
    
  return {
    id: report.id,
    name: report.title,
    title: report.title,
    description: report.description || '',
    type: report.type as ReportType,
    createdAt: report.created_at,
    lastUpdated: report.updated_at,
    status: report.status as 'draft' | 'published' | 'archived',
    createdBy: report.created_by || '',
    data: content.data || [],
    insights: content.insights || [],
    recommendations: content.recommendations || [],
    downloadUrl: `/api/reports/download/${report.id}`,
    summary: content.summary || '',
    tags: report.tags || []
  };
};

/**
 * Hesabat şablonu cədvəlindən məlumatı Report tipinə çevirmək üçün utilit funksiya
 */
export const mapTemplateTableToReport = (template: ReportTemplateTable): Report => {
  return {
    id: template.id,
    name: template.name,
    title: template.name,
    description: template.description || '',
    type: template.type as ReportType,
    createdAt: template.created_at,
    status: 'published' as 'draft' | 'published' | 'archived', // Şablonlar nəşr olunmuş kimi göstərilir
    createdBy: template.created_by || '',
    tags: template.tags || []
  };
};

/**
 * Xəta baş verdikdə bildiriş göstərmək üçün utilit
 */
export const handleReportError = (error: any, message: string): void => {
  console.error(`${message}:`, error);
  toast.error(message);
};
