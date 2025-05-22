import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Report, ReportTypeValues } from '@/types/report';

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Generate mock reports
    const mockReports: Report[] = [
      {
        id: uuidv4(),
        title: 'Regional Completion Statistics Report',
        description: 'Overview of completion rates across all regions',
        type: 'statistics' as ReportTypeValues,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'School Completion Report',
        description: 'Detailed analysis of form completion by schools',
        type: 'completion' as ReportTypeValues,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Sector Comparison Report',
        description: 'Comparison between different sectors',
        type: 'comparison' as ReportTypeValues,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Custom Analytics Report',
        description: 'User defined custom analytics',
        type: 'custom' as ReportTypeValues,
        status: 'archived',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user123',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Individual School Report',
        description: 'Detailed report for a specific school',
        type: 'school' as ReportTypeValues,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user456',
        content: {
          includeCharts: true,
          schoolId: 'school123'
        }
      },
      {
        id: uuidv4(),
        title: 'Category Performance Report',
        description: 'Performance metrics by category',
        type: 'category' as ReportTypeValues,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: false,
          categoryId: 'cat123'
        }
      },
      {
        id: uuidv4(),
        title: 'Basic Analysis Report',
        description: 'Simple analysis of the current data',
        type: 'basic' as ReportTypeValues,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user789',
        content: {
          includeCharts: true
        }
      }
    ];
    
    setReports(mockReports);
  }, []);
  
  const createReport = (reportData: Partial<Report>): Report => {
    const newReport: Report = {
      id: uuidv4(),
      title: reportData.title || 'New Report',
      description: reportData.description || '',
      type: reportData.type || 'basic' as ReportTypeValues,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user',
      content: reportData.content || {},
    };
    
    setReports(prev => [...prev, newReport]);
    return newReport;
  };
  
  const updateReport = (id: string, reportData: Partial<Report>): Report | null => {
    let updatedReport: Report | null = null;
    
    setReports(prev => {
      return prev.map(report => {
        if (report.id === id) {
          updatedReport = {
            ...report,
            ...reportData,
            updated_at: new Date().toISOString()
          };
          return updatedReport;
        }
        return report;
      });
    });
    
    return updatedReport;
  };
  
  const deleteReport = (id: string): void => {
    setReports(prev => prev.filter(report => report.id !== id));
  };
  
  const getReport = (id: string): Report | undefined => {
    return reports.find(report => report.id === id);
  };
  
  return {
    reports,
    loading: false,
    error: null,
    fetchReports: async () => {}, // Mock fetch function
    getReport,
    createReport,
    updateReport,
    deleteReport
  };
};

export default useMockReports;
