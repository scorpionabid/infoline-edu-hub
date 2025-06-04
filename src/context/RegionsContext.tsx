import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Region {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
  region_id: string;
}

interface RegionsContextType {
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  error: any;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

export const RegionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchRegionsAndSectors = async () => {
      setIsLoading(true);
      try {
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('*')
          .order('name', { ascending: true });

        if (regionsError) {
          throw new Error(`Error fetching regions: ${regionsError.message}`);
        }

        const { data: sectorsData, error: sectorsError } = await supabase
          .from('sectors')
          .select('*')
          .order('name', { ascending: true });

        if (sectorsError) {
          throw new Error(`Error fetching sectors: ${sectorsError.message}`);
        }

        setRegions(regionsData || []);
        setSectors(sectorsData || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegionsAndSectors();
  }, [user]);

  const value: RegionsContextType = {
    regions,
    sectors,
    isLoading,
    error,
  };

  return (
    <RegionsContext.Provider value={value}>
      {children}
    </RegionsContext.Provider>
  );
};

export const useRegions = () => {
  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegions must be used within a RegionsProvider');
  }
  return context;
};
