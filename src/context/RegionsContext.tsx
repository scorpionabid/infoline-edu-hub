
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Region {
  id: string;
  name: string;
}

interface RegionsContextType {
  regions: Region[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

export const RegionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setRegions([
        { id: '1', name: 'Bakı' },
        { id: '2', name: 'Gəncə' },
        { id: '3', name: 'Sumqayıt' }
      ]);
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

export const useRegions = () => {
  const context = useContext(RegionsContext);
  if (!context) {
    throw new Error('useRegions must be used within RegionsProvider');
  }
  return context;
};
