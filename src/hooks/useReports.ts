
import { useState, useEffect, useCallback } from 'react';
import { Report, ReportType } from '@/types/report';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

// Müvəqqəti funksiyalar - real servislə əvəzlənəcək
const fetchReports = async (): Promise<Report[]> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve([]);
};

const fetchReportTemplates = async (): Promise<Report[]> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve([]);
};

const addReport = async (report: Partial<Report>): Promise<Report> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve({
    id: Math.random().toString(),
    title: report.title || '',
    description: report.description || '',
    type: report.type || 'basic',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: report.createdBy || '',
  });
};

const editReport = async (id: string, report: Partial<Report>): Promise<Report> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve({
    id,
    title: report.title || '',
    description: report.description || '',
    type: report.type || 'basic',
    updatedAt: new Date(),
    createdAt: new Date(),
    createdBy: report.createdBy || '',
  });
};

const createReportTemplate = async (template: Partial<Report>): Promise<Report> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve({
    id: Math.random().toString(),
    title: template.title || '',
    description: template.description || '',
    type: template.type || 'basic',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: template.createdBy || '',
  });
};

const exportReport = async (reportId: string): Promise<string> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve('https://example.com/report.xlsx');
};

const exportReportAsPdf = async (reportId: string): Promise<string> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve('https://example.com/report.pdf');
};

const exportReportAsCsv = async (reportId: string): Promise<string> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve('https://example.com/report.csv');
};

const shareReportWithUsers = async (reportId: string, userIds: string[]): Promise<boolean> => {
  // Müvəqqəti geri qaytarılan məlumatlar
  return Promise.resolve(true);
};

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const { user } = useAuth();

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReports();
      setReports(data);
      applyFilters(data, searchTerm, typeFilter, statusFilter);
    } catch (err: any) {
      setError(err.message || 'Hesabatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReportTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Hesabat şablonları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((data: Report[], search: string, type: ReportType | 'all', status: 'all' | 'draft' | 'published' | 'archived') => {
    let filtered = [...data];
    
    // Axtarış filtrini tətbiq et
    if (search) {
      filtered = filtered.filter(report => 
        report.title?.toLowerCase().includes(search.toLowerCase()) ||
        report.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Növ filtrini tətbiq et
    if (type !== 'all') {
      filtered = filtered.filter(report => report.type === type);
    }
    
    // Status filtrini tətbiq et (report.status əlavə edilərsə)
    if (status !== 'all') {
      filtered = filtered.filter(report => report.status === status);
    }
    
    setFilteredReports(filtered);
  }, []);

  const createNewReport = useCallback(async (report: Partial<Report>): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    try {
      // İstifadəçi id-sini əlavə et
      const reportWithUser = {
        ...report,
        createdBy: user?.id || ''
      };
      
      const newReport = await addReport(reportWithUser);
      if (newReport) {
        setReports(prev => [newReport, ...prev]);
        applyFilters([newReport, ...reports], searchTerm, typeFilter, statusFilter);
      }
      return newReport;
    } catch (err: any) {
      setError(err.message || 'Hesabat yaradılarkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, reports, searchTerm, typeFilter, statusFilter, applyFilters]);

  const updateReport = useCallback(async (id: string, report: Partial<Report>): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedReport = await editReport(id, report);
      
      if (updatedReport) {
        setReports(prev => prev.map(r => r.id === id ? updatedReport : r));
        applyFilters(reports.map(r => r.id === id ? updatedReport : r), searchTerm, typeFilter, statusFilter);
      }
      return updatedReport;
    } catch (err: any) {
      setError(err.message || 'Hesabat yenilənərkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [reports, searchTerm, typeFilter, statusFilter, applyFilters]);

  const addTemplate = useCallback(async (template: Partial<Report>): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    try {
      // İstifadəçi id-sini əlavə et
      const templateWithUser = {
        ...template,
        createdBy: user?.id || ''
      };
      
      const newTemplate = await createReportTemplate(templateWithUser);
      if (newTemplate) {
        setTemplates(prev => [newTemplate, ...prev]);
      }
      return newTemplate;
    } catch (err: any) {
      setError(err.message || 'Şablon yaradılarkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const downloadReport = useCallback(async (reportId: string, format?: 'pdf' | 'csv'): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      let url;
      
      // Format seçiminə əsaslanaraq müvafiq funksiyanı çağırırıq
      if (format === 'pdf') {
        url = await exportReportAsPdf(reportId);
      } else if (format === 'csv') {
        url = await exportReportAsCsv(reportId);
      } else {
        url = await exportReport(reportId);
      }
      
      return url;
    } catch (err: any) {
      setError(err.message || 'Hesabat ixrac edilərkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const shareReport = useCallback(async (reportId: string, userIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await shareReportWithUsers(reportId, userIds);
      if (success) {
        toast.success('Hesabat uğurla paylaşıldı');
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Hesabat paylaşılarkən xəta baş verdi');
      toast.error('Hesabat paylaşılarkən xəta baş verdi');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, [loadReports, loadTemplates]);

  // Search və filter dəyişdikdə tətbiq et
  useEffect(() => {
    applyFilters(reports, searchTerm, typeFilter, statusFilter);
  }, [reports, searchTerm, typeFilter, statusFilter, applyFilters]);

  return {
    reports,
    filteredReports,
    templates,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    loadReports,
    loadTemplates,
    addReport: createNewReport,
    editReport: updateReport,
    addTemplate,
    downloadReport,
    shareReport
  };
};
