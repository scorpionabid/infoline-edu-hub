
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
}

interface RegionsContextType {
  regions: Region[];
  loading: boolean;
  error: string | null;
  fetchRegions: () => Promise<void>;
  refresh: () => Promise<void>;
  addRegion: (regionData: Partial<Region>) => Promise<any>;
  updateRegion: (id: string, regionData: Partial<Region>) => Promise<any>;
  deleteRegion: (id: string) => Promise<any>;
  assignRegionAdmin: (regionId: string, userId: string) => Promise<any>;
}

const RegionsContext = createContext<RegionsContextType>({
  regions: [],
  loading: false,
  error: null,
  fetchRegions: async () => {},
  refresh: async () => {},
  addRegion: async () => {},
  updateRegion: async () => {},
  deleteRegion: async () => {},
  assignRegionAdmin: async () => {}
});

export const RegionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;

      setRegions(data || []);
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta:', err);
      setError(err.message);
      toast.error('Regionları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchRegions();
  };

  const addRegion = async (regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert(regionData)
        .select();

      if (error) throw error;
      await fetchRegions();
      return { success: true, data };
    } catch (err: any) {
      console.error('Region əlavə edilərkən xəta:', err);
      return { success: false, error: err.message };
    }
  };

  const updateRegion = async (id: string, regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', id)
        .select();

      if (error) throw error;
      await fetchRegions();
      return { success: true, data };
    } catch (err: any) {
      console.error('Region yenilənərkən xəta:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteRegion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRegions();
      return { success: true };
    } catch (err: any) {
      console.error('Region silinərkən xəta:', err);
      return { success: false, error: err.message };
    }
  };

  const assignRegionAdmin = async (regionId: string, userId: string) => {
    try {
      // User role təyin et
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ region_id: regionId })
        .eq('user_id', userId)
        .eq('role', 'regionadmin');

      if (roleError) throw roleError;

      // Region-a admin_id təyin et
      const { error: regionError } = await supabase
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', regionId);

      if (regionError) throw regionError;

      await fetchRegions();
      return { success: true };
    } catch (err: any) {
      console.error('Region admin təyin edilərkən xəta:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return (
    <RegionsContext.Provider 
      value={{ 
        regions, 
        loading, 
        error, 
        fetchRegions, 
        refresh,
        addRegion, 
        updateRegion, 
        deleteRegion, 
        assignRegionAdmin 
      }}
    >
      {children}
    </RegionsContext.Provider>
  );
};

export const useRegions = () => useContext(RegionsContext);
