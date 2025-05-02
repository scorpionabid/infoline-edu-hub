
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  columnId: string;
  columnName: string;
  schoolId: string;
  schoolName: string;
  sectorName: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export const useApprovalData = () => {
  const [data, setData] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { isSectorAdmin, regionId, sectorId } = usePermissions();

  const loadData = useCallback(async (status: 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    setError(null);

    try {
      // Sektor admini və ya Region admini üçün uyğun filtr əlavə et
      let query = supabase
        .from('data_entries')
        .select(`
          id,
          category_id,
          categories(name),
          column_id,
          columns(name),
          school_id,
          schools(name, sector_id, sectors(name)),
          value,
          status,
          created_at
        `)
        .eq('status', status);

      if (isSectorAdmin && sectorId) {
        // Sektor admini yalnız öz sektorundakı məktəblərə aid olan məlumatları görə bilər
        query = query.eq('schools.sector_id', sectorId);
      } else if (regionId) {
        // Region admini yalnız öz regionundakı məktəblərə aid olan məlumatları görə bilər
        query = query.eq('schools.region_id', regionId);
      }

      const { data: entries, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const formattedData = entries.map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        categoryName: entry.categories?.name || 'Unknown Category',
        columnId: entry.column_id,
        columnName: entry.columns?.name || 'Unknown Column',
        schoolId: entry.school_id,
        schoolName: entry.schools?.name || 'Unknown School',
        sectorName: entry.schools?.sectors?.name || 'Unknown Sector',
        value: entry.value || '',
        status: entry.status as 'pending' | 'approved' | 'rejected',
        submittedDate: new Date(entry.created_at).toLocaleDateString(),
      }));

      setData(formattedData);

    } catch (err: any) {
      console.error('Error loading approval data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isSectorAdmin, regionId, sectorId]);

  const approveItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error approving item:', err);
      return false;
    }
  }, []);

  const rejectItem = useCallback(async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason,
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error rejecting item:', err);
      return false;
    }
  }, []);

  return {
    data,
    loading,
    error,
    loadData,
    approveItem,
    rejectItem,
  };
};
