
import { create } from 'zustand';
import { toast } from 'sonner';
import { EnhancedRegion, Region } from '@/types/region';
import { RegionsStoreState } from './types';
import { 
  getRegionsCache, 
  setRegionsCache, 
  isFetchInProgress, 
  setFetchInProgress,
  clearCache 
} from './cache';
import { 
  fetchRegionsFromAPI, 
  addRegionToAPI, 
  updateRegionInAPI, 
  deleteRegionFromAPI 
} from './api';

export const regionsStore = create<RegionsStoreState>((set, get) => ({
  regions: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedStatus: '',
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  
  // Filter methods
  handleSearch: (term: string) => {
    set({ searchTerm: term, currentPage: 1 });
  },
  
  handleStatusFilter: (status: string) => {
    set({ selectedStatus: status, currentPage: 1 });
  },
  
  handlePageChange: (page: number) => {
    set({ currentPage: page });
  },
  
  resetFilters: () => {
    set({ 
      searchTerm: '', 
      selectedStatus: '', 
      currentPage: 1 
    });
  },
  
  // CRUD operations
  fetchRegions: async (t) => {
    try {
      set({ loading: true, error: null });
      
      // Check cache first
      const cachedRegions = getRegionsCache();
      if (cachedRegions && !get().loading) {
        console.log('Using cached regions data');
        set({ regions: cachedRegions, loading: false });
        return cachedRegions;
      }
      
      // Check if fetch is already in progress
      if (isFetchInProgress()) {
        console.log('Regions fetch already in progress, waiting...');
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            const cache = getRegionsCache();
            if (!isFetchInProgress() && cache) {
              clearInterval(checkInterval);
              set({ regions: cache, loading: false });
              resolve(cache);
            }
          }, 100);
        });
      }
      
      setFetchInProgress(true);
      
      const regions = await fetchRegionsFromAPI();
      
      setFetchInProgress(false);
      setRegionsCache(regions);
      set({ regions, loading: false });
      return regions;
    } catch (error) {
      console.error('Unexpected error in fetchRegions:', error);
      const errorMessage = t 
        ? t('errorFetchingRegions') 
        : 'Error fetching regions';
      
      toast.error(errorMessage);
      setFetchInProgress(false);
      set({ error: errorMessage as string, loading: false });
      return [];
    }
  },
  
  getRegionById: (id: string) => {
    return get().regions.find(region => region.id === id);
  },
  
  handleAddRegion: async (regionData: Partial<Region>, t) => {
    try {
      set({ loading: true, error: null });
      
      const newRegion = await addRegionToAPI(regionData);
      
      const updatedRegions = [...get().regions, newRegion];
      set({ regions: updatedRegions, loading: false });
      
      clearCache();
      
      return newRegion;
    } catch (err) {
      console.error('Error adding region:', err);
      const errorMessage = t 
        ? t('errorAddingRegion') 
        : 'Error adding region';
        
      toast.error(errorMessage);
      set({ error: errorMessage as string, loading: false });
      throw err;
    }
  },
  
  handleUpdateRegion: async (id: string, regionData: Partial<Region>, t) => {
    try {
      set({ loading: true, error: null });
      
      const data = await updateRegionInAPI(id, regionData);
      
      const currentRegion = get().regions.find(r => r.id === id);
      
      if (!currentRegion) {
        throw new Error('Region not found');
      }
      
      const updatedRegion: EnhancedRegion = {
        ...currentRegion,
        ...data,
        status: (data.status === 'active' || data.status === 'inactive') ? data.status : 'active' as const,
      };
      
      const updatedRegions = get().regions.map(r => 
        r.id === id ? updatedRegion : r
      );
      
      set({ regions: updatedRegions, loading: false });
      
      clearCache();
      
      return updatedRegion;
    } catch (err) {
      console.error('Error updating region:', err);
      const errorMessage = t 
        ? t('errorUpdatingRegion') 
        : 'Error updating region';
        
      toast.error(errorMessage);
      set({ error: errorMessage as string, loading: false });
      throw err;
    }
  },
  
  handleDeleteRegion: async (id: string, t) => {
    try {
      set({ loading: true, error: null });
      
      await deleteRegionFromAPI(id);
      
      const updatedRegions = get().regions.filter(r => r.id !== id);
      set({ regions: updatedRegions, loading: false });
      
      clearCache();
      
      return true;
    } catch (err) {
      console.error('Error deleting region:', err);
      const errorMessage = t 
        ? t('errorDeletingRegion') 
        : 'Error deleting region';
        
      toast.error(errorMessage);
      set({ error: errorMessage as string, loading: false });
      throw err;
    }
  }
}));

export const fetchRegions = async (t?: (key: string) => string): Promise<EnhancedRegion[]> => {
  return regionsStore.getState().fetchRegions(t);
};

export const useRegionsStore = () => {
  return regionsStore.getState();
};
