
import { supabase } from '@/integrations/supabase/client';
import { RegionItem, SectorItem } from './types';

export const getRegionNames = async (): Promise<RegionItem[]> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');
      
    if (error) throw error;
    
    if (!data || !Array.isArray(data)) return [];
    
    // Hər bir region elementini RegionItem tipinə uyğunlaşdırırıq
    return data.map((region: any) => ({
      id: region.id || '',
      name: region.name || ''
    }));
  } catch (error) {
    console.error('Region adları əldə edilərkən xəta:', error);
    return [];
  }
};

export const getSectorNames = async (): Promise<SectorItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name');
      
    if (error) throw error;
    
    if (!data || !Array.isArray(data)) return [];
    
    // Hər bir sektor elementini SectorItem tipinə uyğunlaşdırırıq
    return data.map((sector: any) => ({
      id: sector.id || '',
      name: sector.name || ''
    }));
  } catch (error) {
    console.error('Sektor adları əldə edilərkən xəta:', error);
    return [];
  }
};
