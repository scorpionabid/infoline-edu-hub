import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalData {
  id: string;
  categoryId: string;
  categoryName: string;
  columnId: string;
  columnName: string;
  schoolId?: string;
  schoolName?: string;
  sectorId?: string;
  sectorName?: string;
  submittedBy: string;
  submittedDate: string;
  status: ApprovalStatus;
  value: string;
}

interface SupabaseCategory {
  id: string;
  name: string;
}

interface SupabaseColumn {
  id: string;
  name: string;
}

interface SupabaseSector {
  id: string;
  name: string;
  region_id: string;
}

interface SupabaseSchool {
  id: string;
  name: string;
  sector_id: string;
  sectors: SupabaseSector;
}

interface DataEntryRecord {
  id: string;
  value: any;
  status: string;
  created_at: string;
  created_by: string;
  category_id: string;
  column_id: string;
  school_id: string;
  categories: SupabaseCategory;
  columns: SupabaseColumn;
  schools: SupabaseSchool;
}

export interface UseApprovalDataReturn {
  data: ApprovalData[];
  loading: boolean;
  error: Error | null;
  loadData: (status?: ApprovalStatus) => Promise<void>;
  approveItem: (id: string) => Promise<boolean>;
  rejectItem: (id: string, reason: string) => Promise<boolean>;
}

export const useApprovalData = (): UseApprovalDataReturn => {
  const [data, setData] = useState<ApprovalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin, regionId, sectorId } = usePermissions();

  // Load the approval data
  const loadData = async (status: ApprovalStatus = 'pending') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading approval data with status: ${status}`);
      
      let query = supabase
        .from('data_entries')
        .select(`
          id,
          value,
          status,
          created_at,
          created_by,
          category_id,
          column_id,
          school_id,
          categories (id, name),
          columns (id, name),
          schools (id, name, sector_id, sectors:sectors (id, name, region_id))
        `)
        .eq('status', status);

      // Apply RLS policy-compatible filters
      if (isSuperAdmin) {
        // SuperAdmin can see all data
      } else if (isRegionAdmin && regionId) {
        // RegionAdmin can only see data from their region
        query = query.eq('schools.sectors.region_id', regionId);
      } else if (isSectorAdmin && sectorId) {
        // SectorAdmin can only see data from their sector
        query = query.eq('schools.sector_id', sectorId);
      } else {
        // Other users don't have approval permissions
        throw new Error('You do not have permission to access approval data');
      }

      const { data: entriesData, error: entriesError } = await query;

      if (entriesError) {
        console.error('Error loading approval data:', entriesError);
        throw entriesError;
      }

      const formattedData: ApprovalData[] = (entriesData as DataEntryRecord[]).map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        categoryName: entry.categories ? entry.categories.name : 'Unknown Category',
        columnId: entry.column_id,
        columnName: entry.columns ? entry.columns.name : 'Unknown Column',
        schoolId: entry.school_id,
        schoolName: entry.schools ? entry.schools.name : 'Unknown School',
        sectorId: entry.schools?.sector_id,
        sectorName: entry.schools?.sectors ? entry.schools.sectors.name : 'Unknown Sector',
        submittedBy: entry.created_by || 'Unknown',
        submittedDate: new Date(entry.created_at).toLocaleString(),
        status: entry.status as ApprovalStatus,
        value: String(entry.value)
      }));

      setData(formattedData);
    } catch (err: any) {
      console.error('Failed to load approval data:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Implement the approve item functionality
  const approveItem = async (id: string): Promise<boolean> => {
    try {
      // Update the data entry status
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Show success notification
      toast.success(t('approvalSuccess'), {
        description: t('recordApprovedSuccessfully')
      });

      // Refresh data
      await loadData();
      return true;
    } catch (err: any) {
      console.error('Failed to approve item:', err);
      toast.error(t('approvalError'), {
        description: err.message || t('errorApprovingRecord')
      });
      return false;
    }
  };

  // Implement the reject item functionality
  const rejectItem = async (id: string, reason: string): Promise<boolean> => {
    try {
      // Update the data entry status
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Show success notification
      toast.success(t('rejectionSuccess'), {
        description: t('recordRejectedSuccessfully')
      });

      // Refresh data
      await loadData();
      return true;
    } catch (err: any) {
      console.error('Failed to reject item:', err);
      toast.error(t('rejectionError'), {
        description: err.message || t('errorRejectingRecord')
      });
      return false;
    }
  };

  // Load data initially
  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    loadData,
    approveItem,
    rejectItem
  };
};

export default useApprovalData;
