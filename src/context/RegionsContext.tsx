import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
}

interface RegionsContextType {
  regions: Region[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

interface RegionsProviderProps {
  children: ReactNode;
}

export const RegionsProvider: React.FC<RegionsProviderProps> = ({ children }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return (
    <RegionsContext.Provider value={{ regions, loading, error, refetch: fetchRegions }}>
      {children}
    </RegionsContext.Provider>
  );
};

export const useRegions = (): RegionsContextType => {
  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegions must be used within a RegionsProvider');
  }
  return context;
};