
import { useState, useEffect, useCallback } from 'react';
import { Report, SchoolColumnData, StatusFilterOptions } from '@/types/report';
import { fetchReports, fetchReportTemplates, createReport, updateReport, createReportTemplate, fetchSchoolColumnData, exportReport } from '@/services/reportService';
import { useAuth } from '@/context/auth';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Hesabatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const addReport = useCallback(async (report: Partial<Report>): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    try {
      // İstifadəçi id-sini əlavə et
      const reportWithUser = {
        ...report,
        createdBy: user?.id || ''
      };
      
      const newReport = await createReport(reportWithUser);
      if (newReport) {
        setReports(prev => [newReport, ...prev]);
      }
      return newReport;
    } catch (err: any) {
      setError(err.message || 'Hesabat yaradılarkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const editReport = useCallback(async (id: string, report: Partial<Report>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await updateReport(id, report);
      if (success) {
        setReports(prev => 
          prev.map(r => r.id === id ? { ...r, ...report } : r)
        );
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Hesabat yenilənərkən xəta baş verdi');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const downloadReport = useCallback(async (reportId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const url = await exportReport(reportId);
      return url;
    } catch (err: any) {
      setError(err.message || 'Hesabat ixrac edilərkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, [loadReports, loadTemplates]);

  return {
    reports,
    templates,
    loading,
    error,
    loadReports,
    loadTemplates,
    addReport,
    editReport,
    addTemplate,
    downloadReport
  };
};
