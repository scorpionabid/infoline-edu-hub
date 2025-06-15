
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { DataEntry } from '@/types/dataEntry';

type DataEntryRow = Database['public']['Tables']['data_entries']['Row'];

export const approvalService = {
  async getApprovalQueue(
    schoolId?: string,
    sectorId?: string,
    regionId?: string,
    limit: number = 50
  ): Promise<DataEntry[]> {
    let query = supabase
      .from('data_entries')
      .select(`
        *,
        schools!inner(name, id),
        categories!inner(name, id)
      `)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    if (sectorId) {
      query = query.eq('schools.sector_id', sectorId);
    }

    if (regionId) {
      query = query.eq('schools.sectors.region_id', regionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching approval queue:', error);
      throw error;
    }

    return data || [];
  },

  async approveEntry(entryId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'approved',
        approval_notes: notes,
        approved_at: new Date().toISOString()
      })
      .eq('id', entryId);

    if (error) {
      console.error('Error approving entry:', error);
      throw error;
    }
  },

  async rejectEntry(entryId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', entryId);

    if (error) {
      console.error('Error rejecting entry:', error);
      throw error;
    }
  },

  async bulkApprove(entryIds: string[], notes?: string): Promise<void> {
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'approved',
        approval_notes: notes,
        approved_at: new Date().toISOString()
      })
      .in('id', entryIds);

    if (error) {
      console.error('Error bulk approving entries:', error);
      throw error;
    }
  },

  async bulkReject(entryIds: string[], reason: string): Promise<void> {
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .in('id', entryIds);

    if (error) {
      console.error('Error bulk rejecting entries:', error);
      throw error;
    }
  }
};
