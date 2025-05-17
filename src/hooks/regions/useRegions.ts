import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseRegionsResult {
  regions: Region[];
  loading: boolean;
  error: Error | null;
  createRegion: (region: { name: string; description?: string; status?: string }) => Promise<{ success: boolean; data?: Region; error?: any }>;
  createRegions: (regions: { name: string; description?: string; status?: string }[]) => Promise<{ success: boolean; data?: any; error?: any }>;
  updateRegion: (regionId: string, updates: Partial<Region>) => Promise<{ success: boolean; data?: Region; error?: any }>;
  deleteRegion: (regionId: string) => Promise<{ success: boolean; error?: any }>;
  fetchRegions: () => Promise<void>;
}

export const useRegions = (): UseRegionsResult => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const createRegion = async (region: { name: string; description?: string; status?: string }): Promise<{ success: boolean; data?: Region; error?: any }> => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert([{ ...region, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      setRegions(prevRegions => [...prevRegions, data]);
      return { success: true, data };
    } catch (err: any) {
      setError(err);
      return { success: false, error: err };
    }
  };

const createRegions = async (regions: { name: string; description?: string; status?: string }[]) => {
  try {
    // Validate the regions array
    const validRegions = regions.filter(region => !!region.name);
    
    if (validRegions.length === 0) {
      throw new Error('At least one region with a valid name is required');
    }
    
    // Add timestamps to each region
    const regionsWithTimestamps = validRegions.map(region => ({
      ...region,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('regions')
      .insert(regionsWithTimestamps)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating regions:', error);
    return { success: false, error };
  }
};

  const updateRegion = async (regionId: string, updates: Partial<Region>): Promise<{ success: boolean; data?: Region; error?: any }> => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', regionId)
        .select()
        .single();

      if (error) throw error;
      setRegions(prevRegions =>
        prevRegions.map(region => (region.id === regionId ? { ...region, ...updates } : region))
      );
      return { success: true, data };
    } catch (err: any) {
      setError(err);
      return { success: false, error: err };
    }
  };

  const deleteRegion = async (regionId: string): Promise<{ success: boolean; error?: any }> => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (error) throw error;
      setRegions(prevRegions => prevRegions.filter(region => region.id !== regionId));
      return { success: true };
    } catch (err: any) {
      setError(err);
      return { success: false, error: err };
    }
  };

  return {
    regions,
    loading,
    error,
    createRegion,
    createRegions,
    updateRegion,
    deleteRegion,
    fetchRegions
  };
};
