
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface ExportOptions {
  status?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  categories?: string[];
  schools?: string[];
  sectors?: string[];
  format: 'csv' | 'excel';
  language: 'az' | 'en' | 'ru' | 'tr';
}

export const useApprovalExport = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  const [isExporting, setIsExporting] = useState(false);

  const exportApprovalData = useCallback(async (options: ExportOptions) => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotAuthenticated'),
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      // Get user role information for RLS filtering
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', user.id)
        .single();

      if (roleError) throw roleError;

      // Build query based on user permissions and export options
      let query = supabase
        .from('data_entries')
        .select(`
          id,
          status,
          value,
          created_at,
          approved_at,
          rejected_at,
          rejection_reason,
          categories (
            id,
            name
          ),
          columns (
            id,
            name,
            type
          ),
          schools (
            id,
            name,
            region_id,
            sector_id,
            regions (
              id,
              name
            ),
            sectors (
              id,
              name
            )
          )
        `);

      // Apply RLS filtering
      if (userRole.role === 'regionadmin') {
        query = query.eq('schools.region_id', userRole.region_id);
      } else if (userRole.role === 'sectoradmin') {
        query = query.eq('schools.sector_id', userRole.sector_id);
      } else if (userRole.role === 'schooladmin') {
        query = query.eq('school_id', userRole.school_id);
      }

      // Apply export filters
      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status);
      }

      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.from.toISOString())
          .lte('created_at', options.dateRange.to.toISOString());
      }

      if (options.categories && options.categories.length > 0) {
        query = query.in('category_id', options.categories);
      }

      if (options.schools && options.schools.length > 0) {
        query = query.in('school_id', options.schools);
      }

      const { data: entries, error: dataError } = await query;
      if (dataError) throw dataError;

      // Format data for export
      const exportData = entries?.map(entry => ({
        [t('id')]: entry.id,
        [t('school')]: entry.schools?.name || '',
        [t('region')]: entry.schools?.regions?.name || '',
        [t('sector')]: entry.schools?.sectors?.name || '',
        [t('category')]: entry.categories?.name || '',
        [t('column')]: entry.columns?.name || '',
        [t('columnType')]: entry.columns?.type || '',
        [t('value')]: entry.value || '',
        [t('status')]: t(entry.status),
        [t('submittedAt')]: new Date(entry.created_at).toLocaleDateString(),
        [t('approvedAt')]: entry.approved_at ? new Date(entry.approved_at).toLocaleDateString() : '',
        [t('rejectedAt')]: entry.rejected_at ? new Date(entry.rejected_at).toLocaleDateString() : '',
        [t('rejectionReason')]: entry.rejection_reason || ''
      })) || [];

      // Export based on format
      if (options.format === 'csv') {
        await exportAsCSV(exportData, options.language);
      } else if (options.format === 'excel') {
        await exportAsExcel(exportData, options.language);
      }

      toast({
        title: t('success'),
        description: t('dataExportedSuccessfully'),
      });

    } catch (error) {
      console.error('Error exporting approval data:', error);
      toast({
        title: t('error'),
        description: t('errorExportingData'),
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  }, [user?.id, t, toast]);

  const exportAsCSV = useCallback(async (data: any[], language: string) => {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `approval_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  const exportAsExcel = useCallback(async (data: any[], language: string) => {
    // For now, export as CSV since we don't have a full Excel library
    // This can be enhanced later with proper Excel export functionality
    await exportAsCSV(data, language);
  }, [exportAsCSV]);

  const exportSectorData = useCallback(async (options: ExportOptions) => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotAuthenticated'),
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      // Get user role information for RLS filtering
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', user.id)
        .single();

      if (roleError) throw roleError;

      // Build query for sector data
      let query = supabase
        .from('sector_data_entries')
        .select(`
          id,
          status,
          value,
          created_at,
          approved_at,
          rejected_at,
          rejection_reason,
          categories (
            id,
            name
          ),
          columns (
            id,
            name,
            type
          ),
          sectors (
            id,
            name,
            region_id,
            regions (
              id,
              name
            )
          )
        `);

      // Apply RLS filtering
      if (userRole.role === 'regionadmin') {
        query = query.eq('sectors.region_id', userRole.region_id);
      } else if (userRole.role === 'sectoradmin') {
        query = query.eq('sector_id', userRole.sector_id);
      }

      // Apply export filters
      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status);
      }

      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.from.toISOString())
          .lte('created_at', options.dateRange.to.toISOString());
      }

      const { data: entries, error: dataError } = await query;
      if (dataError) throw dataError;

      // Format data for export
      const exportData = entries?.map(entry => ({
        [t('id')]: entry.id,
        [t('sector')]: entry.sectors?.name || '',
        [t('region')]: entry.sectors?.regions?.name || '',
        [t('category')]: entry.categories?.name || '',
        [t('column')]: entry.columns?.name || '',
        [t('columnType')]: entry.columns?.type || '',
        [t('value')]: entry.value || '',
        [t('status')]: t(entry.status),
        [t('submittedAt')]: new Date(entry.created_at).toLocaleDateString(),
        [t('approvedAt')]: entry.approved_at ? new Date(entry.approved_at).toLocaleDateString() : '',
        [t('rejectedAt')]: entry.rejected_at ? new Date(entry.rejected_at).toLocaleDateString() : '',
        [t('rejectionReason')]: entry.rejection_reason || ''
      })) || [];

      // Export based on format
      if (options.format === 'csv') {
        await exportAsCSV(exportData, options.language);
      } else if (options.format === 'excel') {
        await exportAsExcel(exportData, options.language);
      }

      toast({
        title: t('success'),
        description: t('sectorDataExportedSuccessfully'),
      });

    } catch (error) {
      console.error('Error exporting sector data:', error);
      toast({
        title: t('error'),
        description: t('errorExportingSectorData'),
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  }, [user?.id, t, toast, exportAsCSV, exportAsExcel]);

  return {
    exportApprovalData,
    exportSectorData,
    isExporting
  };
};
