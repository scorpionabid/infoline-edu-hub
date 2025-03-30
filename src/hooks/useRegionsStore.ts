
import { create } from 'zustand';
import { toast } from 'sonner';
import { Region, RegionFormData, EnhancedRegion } from '@/types/region';
import { addRegion, deleteRegion, fetchRegions, getRegionStats } from '@/services/regionService';

type TranslateFunction = (key: string) => string;

const emptyTranslate = (key: string) => key;

interface RegionsState {
  regions: EnhancedRegion[];
  filteredRegions: EnhancedRegion[];
  loading: boolean;
  error: Error | null;
  searchTerm: string;
  selectedStatus: string | null;
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isOperationComplete: boolean;

  handleSearch: (term: string) => void;
  handleStatusFilter: (status: string | null) => void;
  handleSort: (key: string) => void;
  resetFilters: () => void;
  handlePageChange: (page: number) => void;

  fetchRegions: (translateFunction?: TranslateFunction) => Promise<void>;
  handleAddRegion: (formData: RegionFormData, translateFunction?: TranslateFunction) => Promise<boolean>;
  handleDeleteRegion: (regionId: string, translateFunction?: TranslateFunction) => Promise<boolean>;
  setIsOperationComplete: (value: boolean) => void;
}

export const useRegionsStore = create<RegionsState>((set, get) => ({
  regions: [],
  filteredRegions: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedStatus: null,
  sortConfig: {
    key: 'name',
    direction: 'asc'
  },
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  isOperationComplete: false,
  
  handleSearch: (term: string) => {
    set({ searchTerm: term, currentPage: 1 });
    const { regions, selectedStatus } = get();
    const filtered = filterRegions(regions, term, selectedStatus);
    const sorted = sortRegions(filtered, get().sortConfig);
    set({ filteredRegions: sorted });
  },
  
  handleStatusFilter: (status: string | null) => {
    set({ selectedStatus: status, currentPage: 1 });
    const { regions, searchTerm } = get();
    const filtered = filterRegions(regions, searchTerm, status);
    const sorted = sortRegions(filtered, get().sortConfig);
    set({ filteredRegions: sorted });
  },
  
  handleSort: (key: string) => {
    const { sortConfig, filteredRegions } = get();
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newConfig = { key, direction } as { key: string; direction: 'asc' | 'desc' };
    
    const sorted = sortRegions(filteredRegions, newConfig);
    set({ sortConfig: newConfig, filteredRegions: sorted });
  },
  
  resetFilters: () => {
    const { regions, sortConfig } = get();
    const sorted = sortRegions(regions, sortConfig);
    set({ 
      searchTerm: '', 
      selectedStatus: null, 
      currentPage: 1,
      filteredRegions: sorted
    });
  },
  
  handlePageChange: (page: number) => {
    set({ currentPage: page });
  },
  
  fetchRegions: async (translateFunction = emptyTranslate) => {
    set({ loading: true, error: null });
    
    try {
      const regionsData = await fetchRegions();
      
      const enhancedRegions: EnhancedRegion[] = [];
      
      for (const region of regionsData) {
        try {
          // regionService.ts-dən statistikaları əldə edirik
          const stats = await getRegionStats(region.id);
          
          // regionService-dən alınan adminEmail-i istifadə edirik
          enhancedRegions.push({
            ...region,
            sectorCount: stats.sectorCount || 0,
            schoolCount: stats.schoolCount || 0,
            adminCount: stats.adminCount || 0,
            adminEmail: region.adminEmail || null,
            completionRate: Math.floor(Math.random() * 100)
          });
        } catch (err) {
          console.error(`${region.name} üçün statistik məlumatları əldə edərkən xəta:`, err);
          enhancedRegions.push({
            ...region,
            sectorCount: 0,
            schoolCount: 0,
            adminCount: 0,
            adminEmail: region.adminEmail || null,
            completionRate: 0
          });
        }
      }
      
      const { sortConfig, searchTerm, selectedStatus, pageSize } = get();
      const filtered = filterRegions(enhancedRegions, searchTerm, selectedStatus);
      const sorted = sortRegions(filtered, sortConfig);
      const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
      
      set({ 
        regions: enhancedRegions,
        filteredRegions: sorted,
        totalPages,
        loading: false
      });
    } catch (err: any) {
      console.error('Regionlar yüklənərkən xəta:', err);
      set({ error: err, loading: false });
      
      toast.error(translateFunction('errorOccurred'), {
        description: translateFunction('couldNotLoadRegions')
      });
    }
  },

  handleAddRegion: async (formData: RegionFormData, translateFunction = emptyTranslate) => {
    try {
      console.log("Əlavə edilməyə çalışılır:", formData);
      const regionData = await addRegion({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        adminEmail: formData.adminEmail,
        adminName: formData.adminName,
        adminPassword: formData.adminPassword
      });
      
      console.log("Region əlavə edildi:", regionData);
      set({ isOperationComplete: true });
      
      toast.success(translateFunction('regionAdded'), {
        description: translateFunction('regionAddedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Region yaradılması xətası:', err);
      
      toast.error(translateFunction('errorOccurred'), {
        description: translateFunction('couldNotAddRegion')
      });
      
      return false;
    }
  },
  
  handleDeleteRegion: async (regionId: string, translateFunction = emptyTranslate) => {
    try {
      const result = await deleteRegion(regionId);
      
      if (result.success) {
        set({ isOperationComplete: true });
        
        toast.success(translateFunction('regionDeleted'), {
          description: translateFunction('regionDeletedDesc')
        });
        
        return true;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Region silinməsi xətası:', err);
      
      toast.error(translateFunction('errorOccurred'), {
        description: translateFunction('couldNotDeleteRegion')
      });
      
      return false;
    }
  },
  
  setIsOperationComplete: (value: boolean) => {
    set({ isOperationComplete: value });
  }
}));

const filterRegions = (
  regions: EnhancedRegion[], 
  searchTerm: string, 
  status: string | null
): EnhancedRegion[] => {
  return regions.filter(region => {
    const matchesSearch = !searchTerm || 
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (region.description && region.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = !status || region.status === status;
    
    return matchesSearch && matchesStatus;
  });
};

const sortRegions = (
  regions: EnhancedRegion[], 
  sortConfig: { key: string; direction: 'asc' | 'desc' }
): EnhancedRegion[] => {
  return [...regions].sort((a: any, b: any) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};
