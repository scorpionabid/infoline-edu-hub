
import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useRef } from 'react';
import { EnhancedRegion, Region } from '@/types/region';
import { useRegionsQuery, REGIONS_QUERY_KEY } from './useRegionsQuery';
import { queryClient } from '@/lib/query-client';

interface RegionsStoreState {
  regions: EnhancedRegion[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedStatus: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Filter methods
  handleSearch: (term: string) => void;
  handleStatusFilter: (status: string) => void;
  handlePageChange: (page: number) => void;
  resetFilters: () => void;
  
  // CRUD operations
  fetchRegions: (t?: (key: string) => string) => Promise<EnhancedRegion[]>;
  getRegionById: (id: string) => EnhancedRegion | undefined;
  handleAddRegion: (regionData: Partial<Region>, t?: (key: string) => string) => Promise<EnhancedRegion>;
  handleUpdateRegion: (id: string, regionData: Partial<Region>, t?: (key: string) => string) => Promise<EnhancedRegion>;
  handleDeleteRegion: (id: string, t?: (key: string) => string) => Promise<boolean>;
}

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
  
  // Fetch regions
  fetchRegions: async (t) => {
    try {
      set({ loading: true, error: null });
      
      // Reuse the query client to fetch data
      const data = await queryClient.fetchQuery({
        queryKey: [REGIONS_QUERY_KEY],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('regions')
            .select(`
              *,
              sectors:sectors(count),
              schools:schools(count),
              admin:profiles!regions_admin_id_fkey(id, full_name, email)
            `);
          
          if (error) throw error;
          
          // Process and enhance the data
          const enhancedRegions = (data || []).map(region => {
            const sectors_count = region.sectors?.[0]?.count || 0;
            const schools_count = region.schools?.[0]?.count || 0;
            
            return {
              ...region,
              sectors_count,
              schools_count,
              sector_count: sectors_count,
              school_count: schools_count,
              adminName: region.admin?.full_name,
              adminEmail: region.admin?.email,
              admin_name: region.admin?.full_name,
              admin: region.admin ? {
                id: region.admin.id,
                full_name: region.admin.full_name,
                email: region.admin.email
              } : undefined,
              completion_rate: Math.floor(Math.random() * 100),
              completionRate: Math.floor(Math.random() * 100)
            };
          });
          
          return enhancedRegions;
        }
      });
        
      // Sort regions by name
      const sortedRegions = [...data].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      // Calculate total pages
      const filteredRegions = sortedRegions.filter(region => {
        const searchMatch = !get().searchTerm || 
          region.name.toLowerCase().includes(get().searchTerm.toLowerCase()) ||
          region.description?.toLowerCase().includes(get().searchTerm.toLowerCase());
          
        const statusMatch = !get().selectedStatus || 
          region.status === get().selectedStatus;
          
        return searchMatch && statusMatch;
      });
      
      const totalPages = Math.ceil(filteredRegions.length / get().pageSize);
        
      set({ 
        regions: sortedRegions, 
        totalPages: totalPages || 1,
        loading: false 
      });
        
      return sortedRegions;
    } catch (err: any) {
      console.error('Error loading regions:', err);
      set({ error: String(err), loading: false });
      return [];
    }
  },
  
  // Get region by ID
  getRegionById: (id: string) => {
    return get().regions.find(region => region.id === id);
  },
  
  // Add region
  handleAddRegion: async (regionData: Partial<Region>, t) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Create enhanced region with default values
      const enhancedRegion: EnhancedRegion = {
        ...data,
        adminName: undefined,
        adminEmail: undefined,
        sector_count: 0,
        school_count: 0,
        sectors_count: 0,
        schools_count: 0,
        completion_rate: 0,
        completionRate: 0
      };
      
      // Update state
      set(state => ({
        regions: [...state.regions, enhancedRegion],
        loading: false
      }));
      
      // Invalidate the regions query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [REGIONS_QUERY_KEY] });
      
      const successMessage = t 
        ? t('regionCreatedSuccessfully') 
        : 'Region created successfully';
        
      toast.success(successMessage);
      return enhancedRegion;
    } catch (err: any) {
      console.error('Error creating region:', err);
      set({ loading: false });
      const errorMessage = t 
        ? t('errorCreatingRegion') 
        : 'Error creating region';
        
      toast.error(errorMessage);
      throw err;
    }
  },
  
  // Update region
  handleUpdateRegion: async (id: string, regionData: Partial<Region>, t) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Preserve existing enhanced data
      const existingRegion = get().regions.find(r => r.id === id);
      const enhancedRegion: EnhancedRegion = {
        ...data,
        adminName: existingRegion?.adminName,
        adminEmail: existingRegion?.adminEmail,
        admin_name: existingRegion?.admin_name,
        sector_count: existingRegion?.sector_count || 0,
        school_count: existingRegion?.school_count || 0,
        sectors_count: existingRegion?.sectors_count || 0,
        schools_count: existingRegion?.schools_count || 0,
        completion_rate: existingRegion?.completion_rate || 0,
        completionRate: existingRegion?.completionRate || 0,
        admin: existingRegion?.admin
      };
      
      // Update state
      set(state => ({
        regions: state.regions.map(region => (region.id === id ? enhancedRegion : region)),
        loading: false
      }));
      
      // Invalidate the regions query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [REGIONS_QUERY_KEY] });
      
      const successMessage = t 
        ? t('regionUpdatedSuccessfully') 
        : 'Region updated successfully';
        
      toast.success(successMessage);
      return enhancedRegion;
    } catch (err: any) {
      console.error('Error updating region:', err);
      set({ loading: false });
      const errorMessage = t 
        ? t('errorUpdatingRegion') 
        : 'Error updating region';
        
      toast.error(errorMessage);
      throw err;
    }
  },
  
  // Delete region
  handleDeleteRegion: async (id: string, t) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update state
      set(state => ({
        regions: state.regions.filter(region => region.id !== id),
        loading: false
      }));
      
      // Invalidate the regions query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [REGIONS_QUERY_KEY] });
      
      const successMessage = t 
        ? t('regionDeletedSuccessfully') 
        : 'Region deleted successfully';
        
      toast.success(successMessage);
      return true;
    } catch (err: any) {
      console.error('Error deleting region:', err);
      set({ loading: false });
      const errorMessage = t 
        ? t('errorDeletingRegion') 
        : 'Error deleting region';
        
      toast.error(errorMessage);
      throw err;
    }
  }
}));

// React hook adapter to use Zustand store in components
export const useRegionsStore = () => {
  // Get state and actions from the Zustand store
  const store = regionsStore(state => state);
  
  // Use React Query hook directly
  const {
    regions: queryRegions,
    isLoading: queryLoading,
    refetch,
    searchTerm: querySearchTerm,
    setSearchTerm: querySetSearchTerm,
    selectedStatus: querySelectedStatus,
    setSelectedStatus: querySetSelectedStatus,
    currentPage: queryCurrentPage,
    setCurrentPage: querySetCurrentPage,
    totalPages: queryTotalPages,
    resetFilters: queryResetFilters
  } = useRegionsQuery();
  
  // Refs to track initialization and prevent excess rerenders
  const initializedRef = useRef(false);
  const syncingRef = useRef(false);
  
  // Sync Zustand store with React Query on mount and when React Query data changes
  useEffect(() => {
    const syncToStore = async () => {
      if (syncingRef.current) return;
      
      try {
        syncingRef.current = true;
        
        // If not initialized yet, fetch regions
        if (!initializedRef.current) {
          console.log('Initializing regions store with query data...');
          await store.fetchRegions();
          initializedRef.current = true;
        } 
      } finally {
        syncingRef.current = false;
      }
    };
    
    syncToStore();
  }, [store, queryRegions]);
  
  // Sync filters from store to query
  useEffect(() => {
    if (syncingRef.current) return;
    
    if (store.searchTerm !== querySearchTerm) {
      querySetSearchTerm(store.searchTerm);
    }
    
    if (store.selectedStatus !== querySelectedStatus) {
      querySetSelectedStatus(store.selectedStatus);
    }
    
    if (store.currentPage !== queryCurrentPage) {
      querySetCurrentPage(store.currentPage);
    }
  }, [
    store.searchTerm, querySearchTerm, querySetSearchTerm,
    store.selectedStatus, querySelectedStatus, querySetSelectedStatus,
    store.currentPage, queryCurrentPage, querySetCurrentPage
  ]);
  
  // Create combined refetch function that updates both data sources
  const fetchRegions = useCallback(async () => {
    syncingRef.current = true;
    try {
      console.log('Fetching regions data...');
      // First refetch with React Query
      await refetch();
      // Then sync with Zustand store
      await store.fetchRegions();
      console.log('Regions data fetched successfully');
    } finally {
      syncingRef.current = false;
    }
  }, [refetch, store]);
  
  // Return combined interface with data from React Query but actions from Zustand
  return {
    regions: queryRegions || store.regions,
    loading: queryLoading || store.loading,
    searchTerm: querySearchTerm,
    selectedStatus: querySelectedStatus,
    currentPage: queryCurrentPage,
    totalPages: queryTotalPages || store.totalPages,
    handleSearch: store.handleSearch,
    handleStatusFilter: store.handleStatusFilter,
    handlePageChange: store.handlePageChange,
    resetFilters: queryResetFilters,
    getRegionById: store.getRegionById,
    handleAddRegion: store.handleAddRegion,
    handleUpdateRegion: store.handleUpdateRegion,
    handleDeleteRegion: store.handleDeleteRegion,
    // Make sure fetchRegions is properly awaitable
    fetchRegions
  };
};
