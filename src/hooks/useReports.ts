// Fix type assignments
import { useState, useCallback } from 'react';
import { Report, ReportType } from '@/types/report';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createReport = useCallback(
    (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newReport: Report = {
        id: Math.random().toString(36).substring(2, 9),
        ...reportData,
        type: reportData.type as ReportType,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: reportData.createdBy || 'current-user'
      };

      setReports((prev) => [...prev, newReport]);
      return newReport;
    },
    []
  );

  const updateReport = useCallback(
    (id: string, reportData: Partial<Report>) => {
      const updatedReport: Report = {
        ...reports.find((r) => r.id === id)!,
        ...reportData,
        type: (reportData.type || reports.find((r) => r.id === id)?.type) as ReportType,
        updatedAt: new Date(),
        createdAt: reports.find((r) => r.id === id)?.createdAt || new Date(),
        createdBy: reports.find((r) => r.id === id)?.createdBy || 'current-user'
      };

      setReports((prev) =>
        prev.map((report) => (report.id === id ? updatedReport : report))
      );

      return updatedReport;
    },
    [reports]
  );
  
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // Placeholder for fetching reports from an API
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Sample Report',
          description: 'A sample report for testing',
          type: 'basic',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
        },
      ];
      setReports(mockReports);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((report) => report.id !== id));
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    getReport: (id: string) => reports.find((r) => r.id === id) || null,
    createReport,
    updateReport,
    deleteReport
  };
};

export default useReports;
