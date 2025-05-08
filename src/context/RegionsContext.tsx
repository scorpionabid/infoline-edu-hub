import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './auth';
import { useLanguageSafe } from './LanguageContext';

interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  admin_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface RegionsContextType {
  regions: Region[];
  loading: boolean;
  error: Error | null;
  addRegion: (region: Omit<Region, 'id'>) => Promise<Region>;
  updateRegion: (id: string, region: Partial<Region>) => Promise<Region>;
  deleteRegion: (id: string) => Promise<void>;
  getRegion: (id: string) => Region | undefined;
  refetchRegions: () => Promise<void>;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

export const useRegions = () => {
  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegions must be used within a RegionsProvider');
  }
  return context;
};

export const useRegionsContext = () => useContext(RegionsContext);

export const RegionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { t } = useLanguageSafe();

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      
      setRegions(data || []);
    } catch (err) {
      console.error('Error fetching regions:', err);
      setError(err as Error);
      toast.error(t('errorFetchingRegions'));
    } finally {
      setLoading(false);
    }
  };

  const addRegion = async (region: Omit<Region, 'id'>): Promise<Region> => {
    try {
      setLoading(true);
      setError(null);
      
      const newRegion = {
        name: region.name, // Required property
        description: region.description || '',
        admin_id: region.admin_id || null,
        admin_email: region.admin_email || null,
        status: region.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('regions')
        .insert(newRegion)
        .select()
        .single();
        
      if (error) throw error;
      
      setRegions(prev => [...prev, data]);
      toast.success(t('regionAdded'));
      
      return data;
    } catch (err) {
      console.error('Error adding region:', err);
      setError(err as Error);
      toast.error(t('errorAddingRegion'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRegion = async (id: string, region: Partial<Region>): Promise<Region> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedRegion = {
        ...region,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('regions')
        .update(updatedRegion)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setRegions(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      toast.success(t('regionUpdated'));
      
      return data;
    } catch (err) {
      console.error('Error updating region:', err);
      setError(err as Error);
      toast.error(t('errorUpdatingRegion'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRegion = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('regions')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      setRegions(prev => prev.filter(r => r.id !== id));
      toast.success(t('regionDeleted'));
    } catch (err) {
      console.error('Error deleting region:', err);
      setError(err as Error);
      toast.error(t('errorDeletingRegion'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRegion = (id: string): Region | undefined => {
    return regions.find(r => r.id === id);
  };

  const refetchRegions = async (): Promise<void> => {
    await fetchRegions();
  };

  useEffect(() => {
    if (user) {
      fetchRegions();
    }
  }, [user]);

  const value: RegionsContextType = {
    regions,
    loading,
    error,
    addRegion,
    updateRegion,
    deleteRegion,
    getRegion,
    refetchRegions
  };

  return <RegionsContext.Provider value={value}>{children}</RegionsContext.Provider>;
};
