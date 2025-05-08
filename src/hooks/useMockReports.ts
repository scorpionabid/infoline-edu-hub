
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Report, ReportType } from '@/types/report';

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Generate mock reports
    const mockReports: Report[] = [
      {
        id: uuidv4(),
        title: 'Regional Completion Statistics Report',
        description: 'Overview of completion rates across all regions',
        type: 'statistics' as ReportType,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        parameters: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'School Completion Report',
        description: 'Detailed analysis of form completion by schools',
        type: 'completion' as ReportType,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        parameters: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Sector Comparison Report',
        description: 'Comparison between different sectors',
        type: 'comparison' as ReportType,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        parameters: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Custom Analytics Report',
        description: 'User defined custom analytics',
        type: 'custom' as ReportType,
        status: 'archived',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user123',
        parameters: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Individual School Report',
        description: 'Detailed report for a specific school',
        type: 'school' as ReportType,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user456',
        parameters: {
          includeCharts: true,
          schoolId: 'school123'
        }
      },
      {
        id: uuidv4(),
        title: 'Category Performance Report',
        description: 'Performance metrics by category',
        type: 'category' as ReportType,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        parameters: {
          includeCharts: false,
          categoryId: 'cat123'
        }
      },
      {
        id: uuidv4(),
        title: 'Basic Analysis Report',
        description: 'Simple analysis of the current data',
        type: 'basic' as ReportType,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user789',
        parameters: {
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
      type: reportData.type || 'basic' as ReportType,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      ...reportData
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
            updatedAt: new Date().toISOString()
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
