
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

interface RegionsContextType {
  regions: Region[];
  loading: boolean;
  error: string | null;
  fetchRegions: () => Promise<void>;
}

const RegionsContext = createContext<RegionsContextType>({
  regions: [],
  loading: false,
  error: null,
  fetchRegions: async () => {}
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

  useEffect(() => {
    fetchRegions();
  }, []);

  return (
    <RegionsContext.Provider value={{ regions, loading, error, fetchRegions }}>
      {children}
    </RegionsContext.Provider>
  );
};

export const useRegions = () => useContext(RegionsContext);
