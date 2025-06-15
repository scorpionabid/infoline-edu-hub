import { create } from 'zustand';
import { EnhancedSector } from '@/types/sector';
import { getSectors, getRegions, supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from './auth/useAuthStore'; // Make sure this import is correct

export type { EnhancedSector };

interface SectorFromDB {
  id: string;
  name: string;
  description: string | null;
  region_id: string;
  status: string | null;
  admin_id: string | null;
  admin_email: string | null;
  completion_rate: number | null;
  created_at: string;
  updated_at: string;
  school_count?: number | null;
  regions?: {
    id: string;
    name: string;
  };
  region_name?: string;
}

interface RefetchResult {
  sectors: SectorFromDB[];
  regions: any[];
}

// Helper function to map database sector to EnhancedSector type
const mapToEnhancedSector = (sector: SectorFromDB): EnhancedSector => {
  // Ensure status is either 'active' or 'inactive', default to 'active' if null/undefined
  const status = sector.status === 'inactive' ? 'inactive' : 'active';
  
  return {
    id: sector.id,
    name: sector.name,
    description: sector.description || '',
    region_id: sector.region_id,
    status,
    admin_id: sector.admin_id || null,
    admin_email: sector.admin_email || null,
    completion_rate: sector.completion_rate || 0,
    created_at: sector.created_at,
    updated_at: sector.updated_at,
    region_name: sector.region_name || sector.regions?.name || '',
    school_count: sector.school_count || 0
  };
};

interface SectorsStore {
  sectors: EnhancedSector[];
  regions: any[];
  loading: boolean;
  error: string | null;
  selectedSector: EnhancedSector | null;
  setSectors: (sectors: EnhancedSector[]) => void;
  setRegions: (regions: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedSector: (sector: EnhancedSector | null) => void;
  addSector: (sector: EnhancedSector) => void;
  updateSectorInState: (id: string, updates: Partial<EnhancedSector>) => void;
  removeSectorFromState: (id: string) => void;
  fetchSectors: (regionId?: string) => Promise<EnhancedSector[]>;
  fetchRegions: () => Promise<any[]>;
  refetch: () => Promise<RefetchResult>;
  createSector: (sectorData: Omit<EnhancedSector, 'id' | 'created_at' | 'updated_at'>) => Promise<EnhancedSector>;
  updateSector: (id: string, updates: Partial<EnhancedSector>) => Promise<EnhancedSector>;
  deleteSector: (id: string) => Promise<void>;
}

export const useSectorsStore = create<SectorsStore>((set, get) => ({
  sectors: [],
  regions: [],
  loading: false,
  error: null,
  selectedSector: null,
  
  // State setters
  setSectors: (sectors) => set({ sectors }),
  setRegions: (regions) => set({ regions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedSector: (selectedSector) => set({ selectedSector }),
  
  // Local state operations (kept for backward compatibility)
  addSector: (sector) => set((state) => ({
    sectors: [...state.sectors, sector]
  })),
  
  updateSectorInState: (id, updates) => set((state) => ({
    sectors: state.sectors.map(sector => 
      sector.id === id ? { ...sector, ...updates } : sector
    )
  })),
  
  removeSectorFromState: (id) => set((state) => ({
    sectors: state.sectors.filter(sector => sector.id !== id)
  })),
  
  // Data fetching
  fetchSectors: async (regionId) => {
    console.log('Fetching sectors for region:', regionId);
    set({ loading: true, error: null });
    try {
      if (!regionId) {
        console.warn('No regionId provided to fetchSectors');
        set({ sectors: [], loading: false });
        return;
      }
      
      const sectors = await getSectors(regionId);
      console.log('Fetched sectors:', sectors);
      
      const mappedSectors = Array.isArray(sectors) 
        ? sectors.map(mapToEnhancedSector)
        : [];
        
      set({ 
        sectors: mappedSectors, 
        loading: false 
      });
      
      return mappedSectors;
    } catch (error: any) {
      console.error('Error in fetchSectors:', error);
      const errorMessage = error.message || 'Sektorlar yüklənərkən xəta baş verdi';
      set({ 
        error: errorMessage, 
        sectors: [],
        loading: false 
      });
      toast.error(`Xəta: ${errorMessage}`);
      throw error; // Re-throw to allow components to handle the error if needed
    }
  },
  
  fetchRegions: async () => {
    console.log('Fetching regions');
    set({ loading: true, error: null });
    try {
      const regions = await getRegions();
      console.log('Fetched regions:', regions);
      
      // Ensure we have an array even if the response is falsy
      const safeRegions = Array.isArray(regions) ? regions : [];
      
      set({ 
        regions: safeRegions, 
        loading: false 
      });
      
      return safeRegions;
    } catch (error: any) {
      console.error('Error in fetchRegions:', error);
      const errorMessage = error.message || 'Regionlar yüklənərkən xəta baş verdi';
      set({ 
        error: errorMessage, 
        regions: [],
        loading: false 
      });
      toast.error(`Xəta: ${errorMessage}`);
      throw error; // Re-throw to allow components to handle the error if needed
    }
  },
  
  refetch: async (): Promise<RefetchResult> => {
    console.log('Refetching sectors and regions');
    const { fetchRegions } = get();
    
    // Only update loading state if not already loading
    get().loading || set({ loading: true, error: null });
    
    try {
      // 1. First fetch all regions
      console.log('Fetching regions...');
      const regions = await fetchRegions();
      console.log('Fetched regions:', regions);
      
      // 2. Then fetch all sectors (no regionId to get all sectors)
      console.log('Fetching all sectors...');
      const allSectors = (await getSectors()) || [];
      
      // 3. Map the sectors to EnhancedSector type for the store
      const enhancedSectors = allSectors.map(sector => mapToEnhancedSector(sector));
      
      // 4. Update the store with the fetched data
      set({ 
        sectors: enhancedSectors,
        regions: regions || [],
        loading: false,
        error: null
      });
      
      console.log('Refetch completed successfully', { 
        sectorsCount: allSectors.length,
        regionsCount: (regions || []).length,
        sampleSector: allSectors[0] ? {
          id: allSectors[0].id,
          name: allSectors[0].name,
          region_name: allSectors[0].region_name
        } : 'No sectors found'
      });
      
      // Return the raw data from the database
      return { 
        sectors: allSectors, 
        regions: regions || []
      };
    } catch (error) {
      console.error('Error during refetch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Məlumatlar yenilənərkən xəta baş verdi';
      
      // Only update state if it's still relevant
      if (get().loading) {
        set({ 
          error: errorMessage,
          loading: false
        });
      }
      
      toast.error(`Xəta: ${errorMessage}`);
      throw error;
    }
  },
  
  // CRUD Operations
  createSector: async (sectorData: Omit<EnhancedSector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select()
        .single();

      if (error) throw error;
      
      const newSector = mapToEnhancedSector(data);
      set(state => ({
        sectors: [...state.sectors, newSector],
        loading: false
      }));
      
      toast.success('Sektor uğurla yaradıldı');
      return newSector;
    } catch (error) {
      console.error('Error creating sector:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sektor yaradılarkən xəta baş verdi';
      toast.error(`Xəta: ${errorMessage}`);
      throw error;
    }
  },
  
  updateSector: async (id: string, updates: Partial<EnhancedSector>) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedSector = mapToEnhancedSector(data);
      set(state => ({
        sectors: state.sectors.map(s => s.id === id ? updatedSector : s),
        loading: false
      }));
      
      toast.success('Sektor uğurla yeniləndi');
      return updatedSector;
    } catch (error) {
      console.error('Error updating sector:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sektor yenilənərkən xəta baş verdi';
      toast.error(`Xəta: ${errorMessage}`);
      throw error;
    }
  },
  
  deleteSector: async (id: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        sectors: state.sectors.filter(s => s.id !== id),
        loading: false
      }));
      
      toast.success('Sektor uğurla silindi');
    } catch (error) {
      console.error('Error deleting sector:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sektor silinərkən xəta baş verdi';
      toast.error(`Xəta: ${errorMessage}`);
      throw error;
    }
  }
}));

export default useSectorsStore;
