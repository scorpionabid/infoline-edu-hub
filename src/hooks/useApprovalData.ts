
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

  // Təsdiqlənməli məlumatları çəkən funksiya
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
          categories (name),
          columns (name),
          schools (name, sector_id, sectors:sectors (name, region_id))
        `)
        .eq('status', status);

      // RLS siyasətləri ilə uyğunlaşdırma
      if (isSuperAdmin) {
        // SuperAdmin bütün məlumatları görə bilər
      } else if (isRegionAdmin && regionId) {
        // RegionAdmin öz regionundakı məlumatları görə bilər
        query = query.eq('schools.sectors.region_id', regionId);
      } else if (isSectorAdmin && sectorId) {
        // SectorAdmin öz sektorundakı məlumatları görə bilər
        query = query.eq('schools.sector_id', sectorId);
      } else {
        // Digər istifadəçilər üçün
        throw new Error('Təsdiq məlumatlarına icazəniz yoxdur');
      }

      const { data: entriesData, error: entriesError } = await query;

      if (entriesError) {
        console.error('Error loading approval data:', entriesError);
        throw entriesError;
      }

      const formattedData: ApprovalData[] = entriesData.map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        categoryName: entry.categories?.name || 'Unknown Category',
        columnId: entry.column_id,
        columnName: entry.columns?.name || 'Unknown Column',
        schoolId: entry.school_id,
        schoolName: entry.schools?.name || 'Unknown School',
        sectorId: entry.schools?.sector_id || undefined,
        sectorName: entry.schools?.sectors?.name || 'Unknown Sector',
        submittedBy: entry.created_by || 'Unknown',
        submittedDate: new Date(entry.created_at).toLocaleString(),
        status: entry.status as ApprovalStatus,
        value: entry.value || ''
      }));
      
      setData(formattedData);
    } catch (err) {
      console.error('Error loading approval data:', err);
      setError(err as Error);
      toast.error(t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  // İlkin yükləmə
  useEffect(() => {
    loadData();
  }, []);

  // Məlumatı təsdiqləyən funksiya
  const approveItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error approving item:', error);
        toast.error(t('approvalError'));
        throw error;
      }
      
      console.log(`Item with ID: ${id} approved successfully`);
      toast.success(t('approvalSuccess'));
      
      // Məlumatları yenilə
      await loadData('pending');
      
      return true;
    } catch (err) {
      console.error('Error approving item:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Məlumatı rədd edən funksiya
  const rejectItem = async (id: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'rejected', 
          rejection_reason: reason 
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error rejecting item:', error);
        toast.error(t('rejectionError'));
        throw error;
      }
      
      console.log(`Item with ID: ${id} rejected successfully`);
      toast.success(t('rejectionSuccess'));
      
      // Məlumatları yenilə
      await loadData('pending');
      
      return true;
    } catch (err) {
      console.error('Error rejecting item:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    loadData,
    approveItem,
    rejectItem
  };
};
