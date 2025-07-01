
import { TableNames } from '@/types/db';
import { Report } from '@/types/core/report';

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
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_template: data.is_template || false,
    shared_with: data.shared_with || [],
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
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_template: true,
    shared_with: [],
    insights: [],
    recommendations: []
  };
};

export const handleReportError = (error: any): Error => {
  console.error('Report service error:', error);
  return new Error(error.message || 'Hesabat əməliyyatı zamanı xəta baş verdi');
};
