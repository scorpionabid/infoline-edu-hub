
import { useState } from 'react';
import { Report, ReportType, ReportStatus } from '@/types/report';

export const useReportPreview = () => {
  const [report, setReport] = useState<Report | null>(null);

  const generatePreview = (reportData: Partial<Report>): Report => {
    const newReport: Report = {
      id: reportData.id || 'preview',
      title: reportData.title || 'Preview Report',
      description: reportData.description || '',
      type: (reportData.type as ReportType) || 'bar',
      content: reportData.content || {},
      filters: reportData.filters || {},
      status: (reportData.status as ReportStatus) || 'draft',
      created_at: reportData.created_at || new Date().toISOString(),
      created_by: reportData.created_by || 'current-user',
      updated_at: reportData.updated_at || new Date().toISOString(),
      shared_with: reportData.shared_with || [],
      insights: Array.isArray(reportData.insights) ? reportData.insights : [],
      recommendations: Array.isArray(reportData.recommendations) ? reportData.recommendations : [],
      is_template: reportData.is_template || false
    };

    setReport(newReport);
    return newReport;
  };

  const clearPreview = () => {
    setReport(null);
  };

  return {
    report,
    generatePreview,
    clearPreview
  };
};
