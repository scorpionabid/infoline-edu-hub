
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Region {
  id: string;
  name: string;
}

interface RegionsContextType {
  regions: Region[];
  selectedRegionId: string | null;
  setSelectedRegionId: (id: string | null) => void;
  getRegionById: (id: string) => Region | undefined;
}

const RegionsContext = createContext<RegionsContextType | undefined>(undefined);

interface RegionsProviderProps {
  children: ReactNode;
}

export const RegionsProvider: React.FC<RegionsProviderProps> = ({ children }) => {
  const [regions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const getRegionById = (id: string): Region | undefined => {
    return regions.find(region => region.id === id);
  };

  return (
    <RegionsContext.Provider value={{
      regions,
      selectedRegionId,
      setSelectedRegionId,
      getRegionById
    }}>
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

export const useRegionsContext = () => {
  return useRegions();
};
