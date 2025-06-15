
import { supabase } from '@/integrations/supabase/client';
import { ensureSectorDataEntryStatus } from '@/utils/buildFixes';

export interface SectorDataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: any;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const sectorDataEntryApi = {
  async getBySchool(schoolId: string): Promise<SectorDataEntry[]> {
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Safe type casting for status
    return (data || []).map(item => ({
      ...item,
      status: ensureSectorDataEntryStatus(item.status)
    }));
  },

  async getBySector(sectorId: string): Promise<SectorDataEntry[]> {
    const { data, error } = await supabase
      .from('data_entries')
      .select(`
        *,
        schools!inner(sector_id)
      `)
      .eq('schools.sector_id', sectorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Safe type casting for status
    return (data || []).map(item => ({
      ...item,
      status: ensureSectorDataEntryStatus(item.status)
    }));
  },

  async create(entry: Omit<SectorDataEntry, 'id' | 'created_at' | 'updated_at'>): Promise<SectorDataEntry> {
    const { data, error } = await supabase
      .from('data_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      status: ensureSectorDataEntryStatus(data.status)
    };
  },

  async update(id: string, updates: Partial<SectorDataEntry>): Promise<SectorDataEntry> {
    const { data, error } = await supabase
      .from('data_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      status: ensureSectorDataEntryStatus(data.status)
    };
  }
};
