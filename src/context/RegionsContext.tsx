
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Region, RegionStatus } from '@/types/region';
import { ensureRegionStatus } from '@/utils/buildFixes';

interface RegionsContextType {
  regions: Region[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createRegion: (regionData: any) => Promise<void>;
  updateRegion: (regionId: string, regionData: any) => Promise<void>;
  deleteRegion: (regionId: string) => Promise<void>;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

export const useRegions = () => {
  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegions must be used within a RegionsProvider');
  }
  return context;
};

export const RegionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    data: regions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['regions'],
    queryFn: async (): Promise<Region[]> => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform data to ensure correct types
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        status: ensureRegionStatus(item.status || 'active') as RegionStatus,
        admin_id: item.admin_id || '',
        admin_email: item.admin_email || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });

  const createRegion = async (regionData: any) => {
    const { error } = await supabase
      .from('regions')
      .insert([regionData]);

    if (error) throw error;
    refetch();
  };

  const updateRegion = async (regionId: string, regionData: any) => {
    const { error } = await supabase
      .from('regions')
      .update(regionData)
      .eq('id', regionId);

    if (error) throw error;
    refetch();
  };

  const deleteRegion = async (regionId: string) => {
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);

    if (error) throw error;
    refetch();
  };

  return (
    <RegionsContext.Provider
      value={{
        regions,
        isLoading,
        error: error?.message || null,
        refetch,
        createRegion,
        updateRegion,
        deleteRegion
      }}
    >
      {children}
    </RegionsContext.Provider>
  );
};
