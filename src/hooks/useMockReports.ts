
import { useState, useCallback } from 'react';
import { Report, ReportType } from '@/types/report';

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Ümumi Təhsil Statistikası',
      description: 'Bütün regionlar üzrə məktəblərin ümumi təhsil statistikası',
      type: 'bar' as ReportType,
      createdAt: new Date(2023, 4, 15).toISOString(),
      updatedAt: new Date(2023, 4, 15).toISOString(),
      createdBy: 'admin@example.com',
      parameters: {
        startDate: '2023-01-01',
        endDate: '2023-04-30',
        includeCharts: true
      }
    },
    {
      id: '2',
      title: 'Kateqoriya Tamamlanma Hesabatı',
      description: 'Bütün məktəblərdə kateqoriyaların tamamlanma statusu',
      type: 'pie' as ReportType,
      createdAt: new Date(2023, 4, 10).toISOString(),
      updatedAt: new Date(2023, 4, 10).toISOString(),
      createdBy: 'admin@example.com',
      parameters: {
        startDate: '2023-01-01',
        endDate: '2023-04-30'
      }
    },
    {
      id: '3',
      title: 'Region Müqayisəsi',
      description: 'Regionlar arası məlumat tamamlanma müqayisəsi',
      type: 'line' as ReportType,
      createdAt: new Date(2023, 4, 5).toISOString(),
      updatedAt: new Date(2023, 4, 7).toISOString(),
      createdBy: 'admin@example.com',
      parameters: {
        startDate: '2023-01-01',
        endDate: '2023-04-30',
        includeCharts: true
      }
    },
    {
      id: '4',
      title: 'Xüsusi Hesabat: Təhsil Materialları',
      description: 'Tədris materialları ilə bağlı xüsusi hesabat',
      type: 'table' as ReportType,
      createdAt: new Date(2023, 3, 28).toISOString(),
      updatedAt: new Date(2023, 3, 28).toISOString(),
      createdBy: 'admin@example.com',
      parameters: {
        categoryId: '12345',
        includeCharts: true
      }
    },
    {
      id: '5',
      title: 'Bakı Məktəbləri Hesabatı',
      description: 'Bakı şəhərindəki məktəblər üzrə detallı hesabat',
      type: 'bar' as ReportType,
      createdAt: new Date(2023, 3, 20).toISOString(),
      updatedAt: new Date(2023, 3, 20).toISOString(),
      createdBy: 'admin@example.com',
      parameters: {
        regionId: 'baku-123',
        startDate: '2023-01-01',
        endDate: '2023-03-31'
      }
    },
    {
      id: '6',
      title: 'İnfrastruktur Kateqoriyası Hesabatı',
      description: 'İnfrastruktur kateqoriyası üzrə detallı hesabat',
      type: 'pie' as ReportType,
      createdAt: new Date(2023, 3, 15).toISOString(),
      updatedAt: new Date(2023, 3, 15).toISOString(),
      createdBy: 'admin@example.com',
      parameters: {
        categoryId: 'infrastructure-123',
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        includeCharts: true
      }
    }
  ]);

  const createReport = useCallback((reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'type'> & { type: string }) => {
    const newReport: Report = {
      id: Math.random().toString(36).substring(2, 9),
      ...reportData,
      type: (reportData.type || 'bar') as ReportType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };
    setReports(prev => [...prev, newReport]);
    return newReport;
  }, []);

  const updateReport = useCallback((id: string, reportData: Partial<Report>) => {
    setReports(prev =>
      prev.map(report => (report.id === id ? { 
        ...report, 
        ...reportData, 
        updatedAt: new Date().toISOString() 
      } : report))
    );
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  }, []);

  const fetchReports = useCallback(() => {
    // Mock fetching reports
    return new Promise<Report[]>((resolve) => {
      setTimeout(() => {
        resolve(reports);
      }, 500);
    });
  }, [reports]);

  return {
    reports,
    loading: false,
    error: null,
    getReport: (id: string) => reports.find(r => r.id === id) || null,
    createReport,
    updateReport,
    deleteReport,
    fetchReports
  };
};

export default useMockReports;
