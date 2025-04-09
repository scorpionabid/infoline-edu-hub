
// Hesabat servisi üçün əsas fayl
import { Report, SchoolColumnData, ExportOptions } from '@/types/report';
import { createReport, updateReport, deleteReport } from './report/reportCrudService';
import { getReports, getReportById, getReportTemplates, getReportsByType, getReportsByUser, getSharedReports } from './report/reportFetchService';
import { exportReportToExcel, exportReportToPDF } from './report/reportExportService';

// Hesabat əldə etmə
export const fetchReports = async (): Promise<Report[]> => {
  return getReports();
};

export const fetchReportById = async (id: string): Promise<Report> => {
  return getReportById(id);
};

export const fetchReportTemplates = async (): Promise<Report[]> => {
  return getReportTemplates();
};

export const fetchReportsByType = async (type: string): Promise<Report[]> => {
  return getReportsByType(type);
};

export const fetchReportsByUser = async (userId: string): Promise<Report[]> => {
  return getReportsByUser(userId);
};

export const fetchSharedReports = async (userId: string): Promise<Report[]> => {
  return getSharedReports(userId);
};

// Məktəb-sütun hesabatı üçün məlumatları əldə etmə
export const fetchSchoolColumnData = async (
  categoryId?: string,
  filterOptions?: any
): Promise<SchoolColumnData[]> => {
  // Bu funksiya daha sonra tamamlanacaq
  console.log('Məktəb sütun məlumatları əldə edilir:', categoryId, filterOptions);
  return [];
};

// Hesabat yaratma və redaktə
export const addReport = async (report: Partial<Report>): Promise<Report> => {
  return createReport(report);
};

export const editReport = async (id: string, report: Partial<Report>): Promise<Report> => {
  return updateReport(id, report);
};

export const removeReport = async (id: string): Promise<boolean> => {
  return deleteReport(id);
};

// Hesabat şablonu yaratma
export const createReportTemplate = async (template: Partial<Report>): Promise<Report> => {
  const templateWithFlag = {
    ...template,
    isTemplate: true
  };
  return createReport(templateWithFlag);
};

// Hesabat ixracı
export const exportReport = async (reportId: string, options?: ExportOptions): Promise<string> => {
  const report = await getReportById(reportId);
  await exportReportToExcel(report);
  return ""; // URL əvəzinə boş string qaytarıldı - bu, daha sonra dəyişdiriləcək
};

export const exportReportAsPdf = async (reportId: string, options?: ExportOptions): Promise<string> => {
  try {
    const report = await getReportById(reportId);
    await exportReportToPDF(report);
    return ""; // URL əvəzinə boş string qaytarıldı - bu, daha sonra dəyişdiriləcək
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF ixrac edilərkən xəta baş verdi. Bu funksiya hələ tam tamamlanmayıb.');
  }
};

export const exportReportAsCsv = async (reportId: string, options?: ExportOptions): Promise<string> => {
  // CSV ixracı hələlik Excel kimi işləyir
  return exportReport(reportId, { ...options, format: 'csv' });
};

// Hesabat paylaşımı
export const shareReport = async (reportId: string, userIds: string[]): Promise<boolean> => {
  try {
    const report = await getReportById(reportId);
    const updatedReport = {
      ...report,
      sharedWith: [...(report.sharedWith || []), ...userIds]
    };
    
    await updateReport(reportId, updatedReport);
    return true;
  } catch (error) {
    console.error('Hesabat paylaşımı xətası:', error);
    return false;
  }
};
