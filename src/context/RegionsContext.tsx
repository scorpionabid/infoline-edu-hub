import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

interface RegionsContextProps {
  regions: Region[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const RegionsContext = createContext<RegionsContextProps | undefined>(undefined);

export const useRegions = () => {
  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegions must be used within a RegionsProvider');
  }
  return context;
};

export const RegionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      let query = supabase
        .from('regions')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (user.role === 'regionadmin' && user.region_id) {
        query = query.eq('id', user.region_id);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setRegions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [user]);

  const refetch = () => {
    fetchRegions();
  };

  const value: RegionsContextProps = {
    regions,
    loading,
    error,
    refetch,
  };

  return (
    <RegionsContext.Provider value={value}>
      {children}
    </RegionsContext.Provider>
  );
};

export default RegionsProvider;
