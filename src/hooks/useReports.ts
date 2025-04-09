
import { useState, useEffect, useCallback } from 'react';
import { Report, ReportType } from '@/types/report';
import { 
  fetchReports, 
  fetchReportTemplates, 
  addReport,
  editReport, 
  createReportTemplate, 
  fetchSchoolColumnData, 
  exportReport,
  exportReportAsPdf,
  exportReportAsCsv,
  shareReport
} from '@/services/reportService';
import { useAuth } from '@/context/auth';

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
    
    // Status filtrini tətbiq et
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

  const shareReportWithUsers = useCallback(async (reportId: string, userIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await shareReport(reportId, userIds);
      return success;
    } catch (err: any) {
      setError(err.message || 'Hesabat paylaşılarkən xəta baş verdi');
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
    shareReportWithUsers
  };
};
