
import { useState, useCallback } from 'react';
import { Report, ReportType } from '@/types/report';

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Ümumi Təhsil Statistikası',
      description: 'Bütün regionlar üzrə məktəblərin ümumi təhsil statistikası',
      type: 'statistics' as ReportType,
      createdAt: new Date(2023, 4, 15),
      updatedAt: new Date(2023, 4, 15),
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
      type: 'completion' as ReportType,
      createdAt: new Date(2023, 4, 10),
      updatedAt: new Date(2023, 4, 10),
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
      type: 'comparison' as ReportType,
      createdAt: new Date(2023, 4, 5),
      updatedAt: new Date(2023, 4, 7),
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
      type: 'custom' as ReportType,
      createdAt: new Date(2023, 3, 28),
      updatedAt: new Date(2023, 3, 28),
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
      type: 'school' as ReportType,
      createdAt: new Date(2023, 3, 20),
      updatedAt: new Date(2023, 4, 1),
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
      type: 'category' as ReportType,
      createdAt: new Date(2023, 3, 15),
      updatedAt: new Date(2023, 3, 15),
      createdBy: 'admin@example.com',
      parameters: {
        categoryId: 'infrastructure-123',
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        includeCharts: true
      }
    }
  ]);

  const createReport = useCallback((reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => {
    const newReport: Report = {
      id: Math.random().toString(36).substring(2, 9),
      ...reportData,
      type: 'basic', // Default type
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };
    setReports(prev => [...prev, newReport]);
    return newReport;
  }, []);

  const updateReport = useCallback((id: string, reportData: Partial<Report>) => {
    setReports(prev =>
      prev.map(report => (report.id === id ? { ...report, ...reportData, updatedAt: new Date() } : report))
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
    deleteReport
  };
};

export default useMockReports;
