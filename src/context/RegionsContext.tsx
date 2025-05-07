
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Region } from '@/types/school';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export interface RegionsContextType {
  regions: Region[];
  loading: boolean;
  error: string | null;
  fetchRegions: () => Promise<void>;
  addRegion: (regionData: Partial<Region>) => Promise<void>;
  updateRegion: (regionId: string, regionData: Partial<Region>) => Promise<void>;
  deleteRegion: (regionId: string) => Promise<void>;
  assignRegionAdmin: (regionId: string, userId: string) => Promise<void>;
  getRegionById: (regionId: string) => Region | undefined;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

export const RegionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Regionların yüklənməsi
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
      console.error('Error fetching regions:', err);
      setError(err.message);
      toast.error('Regionları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Region əlavə et
  const addRegion = async (regionData: Partial<Region>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert({ ...regionData })
        .select()
        .single();

      if (error) throw error;
      
      setRegions(prev => [...prev, data]);
      toast.success('Region uğurla əlavə edildi');
    } catch (err: any) {
      console.error('Error adding region:', err);
      toast.error('Region əlavə edilərkən xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Region yenilə
  const updateRegion = async (regionId: string, regionData: Partial<Region>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', regionId)
        .select()
        .single();

      if (error) throw error;
      
      setRegions(prev => prev.map(region => 
        region.id === regionId ? { ...region, ...data } : region
      ));
      toast.success('Region uğurla yeniləndi');
    } catch (err: any) {
      console.error('Error updating region:', err);
      toast.error('Region yenilənərkən xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Region sil
  const deleteRegion = async (regionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (error) throw error;
      
      setRegions(prev => prev.filter(region => region.id !== regionId));
      toast.success('Region uğurla silindi');
    } catch (err: any) {
      console.error('Error deleting region:', err);
      toast.error('Region silinərkən xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Region adminini təyin et
  const assignRegionAdmin = async (regionId: string, userId: string) => {
    setLoading(true);
    try {
      // İlk öncə istifadəçiyə regionadmin rolu təyin edək
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'regionadmin', region_id: regionId })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Sonra regionun admin_id-sini yeniləyək
      const { error: regionError } = await supabase
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', regionId);

      if (regionError) throw regionError;
      
      // Regions array'ini yeniləyək
      setRegions(prev => prev.map(region => 
        region.id === regionId ? { ...region, admin_id: userId } : region
      ));
      
      toast.success('Region adminisi uğurla təyin edildi');
    } catch (err: any) {
      console.error('Error assigning region admin:', err);
      toast.error('Region adminisi təyin edilərkən xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Region ID-sinə görə region obyektini əldə et
  const getRegionById = (regionId: string) => {
    return regions.find(region => region.id === regionId);
  };

  // İlkin yüklənmə
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
        addRegion,
        updateRegion,
        deleteRegion,
        assignRegionAdmin,
        getRegionById
      }}
    >
      {children}
    </RegionsContext.Provider>
  );
};

export const useRegionsContext = (): RegionsContextType => {
  const context = useContext(RegionsContext);
  if (context === undefined) {
    throw new Error('useRegionsContext must be used within a RegionsProvider');
  }
  return context;
};
