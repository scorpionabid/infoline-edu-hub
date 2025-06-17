
import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus } from '@/types/dataEntry';

export const dataEntryApi = {
  async getDataEntries(schoolId: string, categoryId: string) {
    const { data, error } = await supabase
      .from('data_entries')
      .select(`
        *,
        columns!inner(id, name, type),
        categories!inner(id, name)
      `)
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);

    if (error) throw error;
    return data;
  },

  async saveDataEntry(entryData: any) {
    const { data, error } = await supabase
      .from('data_entries')
      .upsert(entryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(entryId: string, status: DataEntryStatus, comment?: string) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === DataEntryStatus.APPROVED) {
      const { data: user } = await supabase.auth.getUser();
      updateData.approved_by = user.user?.id;
      updateData.approved_at = new Date().toISOString();
    }

    if (status === DataEntryStatus.REJECTED) {
      const { data: user } = await supabase.auth.getUser();
      updateData.rejected_by = user.user?.id;
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = comment;
    }

    const { data, error } = await supabase
      .from('data_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDataEntry(entryId: string) {
    const { error } = await supabase
      .from('data_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  }
};
