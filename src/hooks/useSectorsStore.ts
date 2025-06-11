
import { create } from 'zustand';
import { Sector } from '@/types/sector';

export interface EnhancedSector extends Sector {
  region_name?: string;
  school_count?: number;
  completion_rate?: number;
}

interface SectorsStore {
  sectors: EnhancedSector[];
  loading: boolean;
  error: string | null;
  selectedSector: EnhancedSector | null;
  
  setSectors: (sectors: EnhancedSector[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedSector: (sector: EnhancedSector | null) => void;
  
  addSector: (sector: EnhancedSector) => void;
  updateSector: (id: string, updates: Partial<EnhancedSector>) => void;
  deleteSector: (id: string) => void;
}

export const useSectorsStore = create<SectorsStore>((set) => ({
  sectors: [],
  loading: false,
  error: null,
  selectedSector: null,
  
  setSectors: (sectors) => set({ sectors }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedSector: (selectedSector) => set({ selectedSector }),
  
  addSector: (sector) => set((state) => ({ 
    sectors: [...state.sectors, sector] 
  })),
  
  updateSector: (id, updates) => set((state) => ({
    sectors: state.sectors.map(sector => 
      sector.id === id ? { ...sector, ...updates } : sector
    )
  })),
  
  deleteSector: (id) => set((state) => ({
    sectors: state.sectors.filter(sector => sector.id !== id)
  }))
}));

export default useSectorsStore;
