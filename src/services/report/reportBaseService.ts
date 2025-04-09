
import { supabase } from '@/integrations/supabase/client';
import { TableNames } from '@/types/db';
import { Report } from '@/types/report';

export const getReportTableName = (): string => {
  return TableNames.REPORTS;
};

export const getReportTemplateTableName = (): string => {
  return TableNames.REPORT_TEMPLATES;
};

export const mapReportTableToReport = (data: any): Report => {
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    type: data.type,
    status: data.status,
    content: data.content || {},
    filters: data.filters || {},
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    isTemplate: data.is_template || false,
    sharedWith: data.shared_with || [],
    insights: data.insights || [],
    recommendations: data.recommendations || []
  };
};

export const mapTemplateTableToReport = (data: any): Report => {
  return {
    id: data.id,
    title: data.name,
    description: data.description || '',
    type: data.type,
    status: data.status,
    content: data.config || {},
    filters: {},
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    isTemplate: true,
    sharedWith: [],
    insights: [],
    recommendations: []
  };
};

export const handleReportError = (error: any): Error => {
  console.error('Report service error:', error);
  return new Error(error.message || 'Hesabat əməliyyatı zamanı xəta baş verdi');
};
