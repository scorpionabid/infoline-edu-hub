
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './LanguageContext';
import { Region, Sector } from '@/types/school';

interface RegionsContextType {
  regions: Region[];
  sectors: Sector[];
  selectedRegion: string | null;
  setSelectedRegion: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  fetchRegions: () => Promise<void>;
  fetchSectorsByRegion: (regionId: string) => Promise<Sector[]>;
  createRegion: (regionData: Partial<Region>) => Promise<any>;
  updateRegion: (id: string, regionData: Partial<Region>) => Promise<any>;
  deleteRegion: (id: string) => Promise<any>;
}

const RegionsContext = createContext<RegionsContextType>({
  regions: [],
  sectors: [],
  selectedRegion: null,
  setSelectedRegion: () => {},
  loading: false,
  error: null,
  fetchRegions: async () => {},
  fetchSectorsByRegion: async () => [],
  createRegion: async () => {},
  updateRegion: async () => {},
  deleteRegion: async () => {},
});

export const useRegionsContext = () => useContext(RegionsContext);

interface RegionsProviderProps {
  children: ReactNode;
}

export const RegionsProvider: React.FC<RegionsProviderProps> = ({ children }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchRegions = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);

      setRegions(data || []);
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      setError(err.message || t('errorFetchingRegions'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorsByRegion = async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      
      setSectors(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error fetching sectors by region:', err);
      return [];
    }
  };

  const createRegion = async (regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert(regionData)
        .select();

      if (error) throw new Error(error.message);
      
      fetchRegions(); // Yeniləmək
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating region:', err);
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

      if (error) throw new Error(error.message);
      
      fetchRegions(); // Yeniləmək
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating region:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteRegion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      fetchRegions(); // Yeniləmək
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting region:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchSectorsByRegion(selectedRegion);
    } else {
      setSectors([]);
    }
  }, [selectedRegion]);

  return (
    <RegionsContext.Provider
      value={{
        regions,
        sectors,
        selectedRegion,
        setSelectedRegion,
        loading,
        error,
        fetchRegions,
        fetchSectorsByRegion,
        createRegion,
        updateRegion,
        deleteRegion
      }}
    >
      {children}
    </RegionsContext.Provider>
  );
};

export default RegionsContext;
