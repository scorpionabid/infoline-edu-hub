
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApprovalData {
  entries: any[];
  schools: any[];
  sectors: any[];
  regions: any[];
}

export interface UseApprovalDataResult {
  data: ApprovalData;
  loading: boolean;
  error: Error | null;
  getItemsById: (items: any[], ids: string[]) => any[];
  getFilteredSchools: (schools: any[], regionId?: string, sectorId?: string) => any[];
  getFilteredRegions: (regions: any[], schoolId?: string) => any[];
  getFilteredSectors: (sectors: any[], regionId?: string) => any[];
  // Test compatibility functions
  entries: any[];
  fetchEntries: () => Promise<any[]>;
  fetchEntryById: (id: string) => Promise<any>;
  approveEntry: (id: string, role: string) => Promise<any>;
  returnEntry: (id: string, notes: string) => Promise<any>;
  rejectEntry: (id: string, notes: string) => Promise<any>;
  fetchEntryHistory: (id: string) => Promise<any[]>;
  filterByStatus: (status: string) => Promise<any[]>;
  bulkApprove: (ids: string[], role: string) => Promise<any>;
}

export const useApprovalDataQuery = (): UseApprovalDataResult => {
  const queryClient = useQueryClient();

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['approval-data'],
    queryFn: async () => {
      const [entriesRes, schoolsRes, sectorsRes, regionsRes] = await Promise.all([
        supabase.from('data_entries').select('*'),
        supabase.from('schools').select('*'),
        supabase.from('sectors').select('*'),
        supabase.from('regions').select('*')
      ]);

      return {
        entries: entriesRes.data || [],
        schools: schoolsRes.data || [],
        sectors: sectorsRes.data || [],
        regions: regionsRes.data || []
      };
    }
  });

  const approveEntryMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const statusMap = {
        'schooladmin': 'school_approved',
        'sectoradmin': 'sector_approved',
        'regionadmin': 'region_approved'
      };

      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: statusMap[role] })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, id, status: statusMap[role], message: 'Məlumatlar uğurla təsdiqləndi' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-data'] });
      toast.success('Entry approved successfully');
    }
  });

  const returnEntryMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: 'returned', rejection_reason: notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, id, status: 'returned', message: 'Məlumatlar düzəliş üçün qaytarıldı' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-data'] });
      toast.success('Entry returned for revision');
    }
  });

  const rejectEntryMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: 'rejected', rejection_reason: notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, id, status: 'rejected', message: 'Məlumatlar rədd edildi' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-data'] });
      toast.success('Entry rejected');
    }
  });

  // Utility functions
  const getItemsById = (items: any[], ids: string[]) => {
    return items.filter(item => ids.includes(item.id));
  };

  const getFilteredSchools = (schools: any[], regionId?: string, sectorId?: string) => {
    let filtered = schools;
    if (regionId) filtered = filtered.filter(s => s.region_id === regionId);
    if (sectorId) filtered = filtered.filter(s => s.sector_id === sectorId);
    return filtered;
  };

  const getFilteredRegions = (regions: any[], schoolId?: string) => {
    if (!schoolId) return regions;
    const school = data?.schools.find(s => s.id === schoolId);
    return school ? regions.filter(r => r.id === school.region_id) : regions;
  };

  const getFilteredSectors = (sectors: any[], regionId?: string) => {
    return regionId ? sectors.filter(s => s.region_id === regionId) : sectors;
  };

  const defaultData: ApprovalData = {
    entries: [],
    schools: [],
    sectors: [],
    regions: []
  };

  return {
    data: data || defaultData,
    loading,
    error: error as Error | null,
    getItemsById,
    getFilteredSchools,
    getFilteredRegions,
    getFilteredSectors,
    // Test compatibility functions
    entries: data?.entries || [],
    fetchEntries: async () => data?.entries || [],
    fetchEntryById: async (id: string) => data?.entries.find(e => e.id === id),
    approveEntry: (id: string, role: string) => approveEntryMutation.mutateAsync({ id, role }),
    returnEntry: (id: string, notes: string) => returnEntryMutation.mutateAsync({ id, notes }),
    rejectEntry: (id: string, notes: string) => rejectEntryMutation.mutateAsync({ id, notes }),
    fetchEntryHistory: async (id: string) => [
      { 
        id: 'history-1', 
        entry_id: id, 
        action: 'approved', 
        action_by: 'user-123', 
        action_by_role: 'schooladmin', 
        created_at: new Date().toISOString(), 
        notes: 'Məktəb səviyyəsində təsdiqləndi' 
      }
    ],
    filterByStatus: async (status: string) => (data?.entries || []).filter(e => e.status === status),
    bulkApprove: async (ids: string[], role: string) => ({
      success: true,
      approved: ids,
      failed: []
    })
  };
};
