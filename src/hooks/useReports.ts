
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Report, ReportType } from '@/types/report';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'report-1',
      title: 'School Performance Overview',
      description: 'Annual performance metrics for all schools',
      type: 'school' as ReportType,
      status: 'published',
      createdAt: '2023-04-15T10:30:00Z',
      updatedAt: '2023-04-15T10:30:00Z',
      createdBy: 'admin'
    },
    {
      id: 'report-2',
      title: 'Regional Comparison',
      description: 'Comparing data across different regions',
      type: 'comparison' as ReportType,
      status: 'draft',
      createdAt: '2023-04-10T14:20:00Z',
      updatedAt: '2023-04-12T09:15:00Z',
      createdBy: 'user1'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    // This would be an API call in a real application
    setLoading(true);
    try {
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, we'd fetch from an API here
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
    }
  }, []);

  const getReport = useCallback((id: string): Report => {
    const report = reports.find(r => r.id === id);
    if (!report) {
      throw new Error(`Report with id ${id} not found`);
    }
    return report;
  }, [reports]);

  const createReport = useCallback((reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Report => {
    const newReport: Report = {
      id: uuidv4(),
      ...reportData,
      type: reportData.type || 'basic' as ReportType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setReports(prev => [...prev, newReport]);
    return newReport;
  }, []);

  const updateReport = useCallback((id: string, reportData: Partial<Report>): Report => {
    let updatedReport: Report;
    
    setReports(prev => {
      const newReports = prev.map(report => {
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
      
      // If the report doesn't exist, throw an error
      if (!newReports.some(report => report.id === id)) {
        throw new Error(`Report with id ${id} not found`);
      }
      
      return newReports;
    });
    
    return getReport(id);
  }, [getReport]);

  const deleteReport = useCallback((id: string): void => {
    setReports(prev => {
      // Check if report exists
      if (!prev.some(report => report.id === id)) {
        throw new Error(`Report with id ${id} not found`);
      }
      
      return prev.filter(report => report.id !== id);
    });
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    getReport,
    createReport,
    updateReport,
    deleteReport
  };
};
