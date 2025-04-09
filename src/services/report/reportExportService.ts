
import { supabase } from '@/integrations/supabase/client';
import { TableNames } from '@/types/db';
import { handleReportError } from './reportBaseService';

/**
 * Hesabatı ixrac etmək üçün servis
 */
export const exportReport = async (reportId: string): Promise<string | null> => {
  try {
    // Supabase tipini any kimi istifadə edərək xətadan qaçırıq
    const { data: report, error } = await supabase
      .from(TableNames.REPORTS)
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (error) throw error;
    
    // Burada hesabat ixrac əməliyyatını həyata keçirmək üçün 
    // əlavə məntiq və serverlə əlaqə əlavə edilə bilər
    
    // Bu versiyada sadəcə bir link qaytarırıq
    return `/api/reports/download/${reportId}`;
  } catch (error: any) {
    handleReportError(error, 'Hesabat ixrac edilərkən xəta baş verdi');
    return null;
  }
};

/**
 * PDF formatında hesabat ixrac etmək üçün servis
 */
export const exportReportAsPdf = async (reportId: string): Promise<string | null> => {
  try {
    // Burada hesabatı PDF olaraq ixrac etmə məntiqi əlavə ediləcək
    // Gələcəkdə tətbiq ediləcək
    
    // Test üçün eyni linki qaytarırıq
    return `/api/reports/download/${reportId}?format=pdf`;
  } catch (error: any) {
    handleReportError(error, 'Hesabat PDF formatında ixrac edilərkən xəta baş verdi');
    return null;
  }
};

/**
 * CSV formatında hesabat ixrac etmək üçün servis
 */
export const exportReportAsCsv = async (reportId: string): Promise<string | null> => {
  try {
    // Burada hesabatı CSV olaraq ixrac etmə məntiqi əlavə ediləcək
    // Gələcəkdə tətbiq ediləcək
    
    // Test üçün eyni linki qaytarırıq
    return `/api/reports/download/${reportId}?format=csv`;
  } catch (error: any) {
    handleReportError(error, 'Hesabat CSV formatında ixrac edilərkən xəta baş verdi');
    return null;
  }
};

/**
 * Hesabatı paylaşmaq üçün servis
 */
export const shareReport = async (reportId: string, userIds: string[]): Promise<boolean> => {
  try {
    // Hesabatı əldə et
    const { data: report, error: reportError } = await supabase
      .from(TableNames.REPORTS)
      .select('shared_with')
      .eq('id', reportId)
      .single();
      
    if (reportError) throw reportError;
    
    // Paylaşım siyahısını yenilə
    let sharedWith = Array.isArray(report.shared_with) ? report.shared_with : [];
    
    // Yeni istifadəçiləri əlavə et (təkrarları silərək)
    const newSharedWith = [...new Set([...sharedWith, ...userIds])];
    
    // Yeniləməni göndər
    const { error: updateError } = await supabase
      .from(TableNames.REPORTS)
      .update({
        shared_with: newSharedWith
      })
      .eq('id', reportId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error: any) {
    handleReportError(error, 'Hesabat paylaşılarkən xəta baş verdi');
    return false;
  }
};
