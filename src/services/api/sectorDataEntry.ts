
import { supabase } from '@/integrations/supabase/client';

export const fetchSectorDataEntries = async (options: { categoryId: string; sectorId: string }) => {
  const { categoryId, sectorId } = options;
  
  const { data, error } = await supabase
    .from('sector_data_entries')
    .select('*')
    .eq('category_id', categoryId)
    .eq('sector_id', sectorId);
  
  if (error) throw error;
  return data || [];
};

export const saveSectorDataEntries = async (
  entries: any[],
  categoryId: string,
  sectorId: string,
  userId?: string
) => {
  const entriesData = entries.map(entry => ({
    ...entry,
    category_id: categoryId,
    sector_id: sectorId,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('sector_data_entries')
    .upsert(entriesData, { onConflict: 'sector_id,category_id,column_id' })
    .select();
  
  if (error) throw error;
  return data;
};
