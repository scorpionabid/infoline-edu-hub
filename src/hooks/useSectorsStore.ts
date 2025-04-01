
import { create } from 'zustand';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { fetchSectors as fetchSectorsApi, addSector, deleteSector } from '@/services/sectorService';
import { Sector } from '@/types/sector';
import { supabase } from '@/integrations/supabase/client';

type TranslateFunction = (key: string) => string;

// Default tərcümə funksiyası
const emptyTranslate = (key: string) => key;

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface SectorsState {
  sectors: Sector[];
  filteredSectors: Sector[];
  loading: boolean;
  error: Error | null;
  searchTerm: string;
  selectedStatus: string | null;
  sortConfig: SortConfig;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isOperationComplete: boolean;
  
  handleSearch: (term: string) => void;
  handleStatusFilter: (status: string | null) => void;
  handleSort: (key: string) => void;
  resetFilters: () => void;
  handlePageChange: (page: number) => void;
  
  fetchSectors: (regionId?: string) => Promise<void>;
  handleAddSector: (sectorData: any, translateFunction?: TranslateFunction) => Promise<boolean>;
  handleUpdateSector: (sectorId: string, updates: any, translateFunction?: TranslateFunction) => Promise<boolean>;
  handleDeleteSector: (sectorId: string, translateFunction?: TranslateFunction) => Promise<boolean>;
  setIsOperationComplete: (value: boolean) => void;
}

export const useSectorsStore = create<SectorsState>((set, get) => ({
  sectors: [],
  filteredSectors: [],
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
    const { sectors, selectedStatus } = get();
    const filtered = filterSectors(sectors, term, selectedStatus);
    const sorted = sortSectors(filtered, get().sortConfig);
    const totalPages = Math.max(1, Math.ceil(sorted.length / get().pageSize));
    set({ filteredSectors: sorted, totalPages });
  },
  
  handleStatusFilter: (status: string | null) => {
    set({ selectedStatus: status, currentPage: 1 });
    const { sectors, searchTerm } = get();
    const filtered = filterSectors(sectors, searchTerm, status);
    const sorted = sortSectors(filtered, get().sortConfig);
    const totalPages = Math.max(1, Math.ceil(sorted.length / get().pageSize));
    set({ filteredSectors: sorted, totalPages });
  },
  
  handleSort: (key: string) => {
    const { sortConfig, filteredSectors } = get();
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newConfig = { key, direction } as SortConfig;
    
    const sorted = sortSectors(filteredSectors, newConfig);
    set({ sortConfig: newConfig, filteredSectors: sorted });
  },
  
  resetFilters: () => {
    const { sectors, sortConfig, pageSize } = get();
    const sorted = sortSectors(sectors, sortConfig);
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    
    set({
      searchTerm: '',
      selectedStatus: null,
      currentPage: 1,
      filteredSectors: sorted,
      totalPages
    });
  },
  
  handlePageChange: (page: number) => {
    set({ currentPage: page });
  },
  
  fetchSectors: async (regionId?: string) => {
    set({ loading: true, error: null });
    
    try {
      console.log('Sektorlar yüklənir...', regionId ? `Region ID: ${regionId}` : 'Bütün regionlar üçün');
      const sectorsData = await fetchSectorsApi(regionId);
      console.log(`${sectorsData.length} sektor yükləndi`, sectorsData);
      
      const { sortConfig, searchTerm, selectedStatus, pageSize } = get();
      const filtered = filterSectors(sectorsData, searchTerm, selectedStatus);
      const sorted = sortSectors(filtered, sortConfig);
      const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
      
      set({
        sectors: sectorsData,
        filteredSectors: sorted,
        totalPages,
        loading: false
      });
      
      console.log('Sektorlar yükləmə tamamlandı');
    } catch (err: any) {
      console.error('Sektorlar yüklənərkən xəta:', err);
      set({ error: err, loading: false });
      
      toast.error('Xəta baş verdi', {
        description: 'Sektorlar yüklənə bilmədi'
      });
    }
  },
  
  handleAddSector: async (sectorData: any, translateFunction = emptyTranslate) => {
    try {
      console.log("Sektor əlavə edilir:", sectorData);
      
      const newSector = await addSector({
        name: sectorData.name,
        description: sectorData.description,
        regionId: sectorData.region_id || sectorData.regionId,
        status: sectorData.status as 'active' | 'inactive',
        adminEmail: sectorData.adminEmail,
        adminName: sectorData.adminName,
        adminPassword: sectorData.adminPassword
      });
      
      console.log("Sektor əlavə edildi:", newSector);
      
      set(state => ({
        sectors: [...state.sectors, {
          ...newSector,
          status: newSector.status as 'active' | 'inactive'
        }],
        isOperationComplete: true
      }));
      
      get().handleSearch(get().searchTerm);
      
      toast.success(translateFunction('sectorCreated') || 'Sektor yaradıldı', {
        description: translateFunction('sectorCreatedDesc') || 'Sektor uğurla yaradıldı'
      });
      
      return true;
    } catch (err: any) {
      console.error('Sektor yaradılması xətası:', err);
      
      toast.error(translateFunction('errorOccurred') || 'Xəta baş verdi', {
        description: err.message || translateFunction('couldNotCreateSector') || 'Sektor yaradıla bilmədi'
      });
      
      return false;
    }
  },
  
  handleUpdateSector: async (sectorId: string, updates: any, translateFunction = emptyTranslate) => {
    try {
      console.log("Sektor yenilənir:", { sectorId, ...updates });
      
      const { data, error } = await supabase
        .from('sectors')
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status as 'active' | 'inactive',
          region_id: updates.region_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectorId)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log("Sektor yeniləndi:", data);
      
      set(state => ({
        sectors: state.sectors.map(sector => 
          sector.id === sectorId ? {
            ...sector,
            ...data,
            status: data.status as 'active' | 'inactive'
          } : sector
        ),
        isOperationComplete: true
      }));
      
      get().handleSearch(get().searchTerm);
      
      toast.success(translateFunction('sectorUpdated') || 'Sektor yeniləndi', {
        description: translateFunction('sectorUpdatedDesc') || 'Sektor məlumatları uğurla yeniləndi'
      });
      
      return true;
    } catch (err: any) {
      console.error('Sektor yenilənməsi xətası:', err);
      
      toast.error(translateFunction('errorOccurred') || 'Xəta baş verdi', {
        description: err.message || translateFunction('couldNotUpdateSector') || 'Sektor yenilənə bilmədi'
      });
      
      return false;
    }
  },
  
  handleDeleteSector: async (sectorId: string, translateFunction = emptyTranslate) => {
    try {
      console.log("Sektor silinir:", sectorId);
      
      const result = await deleteSector(sectorId);
      
      if (result.success) {
        set(state => ({
          sectors: state.sectors.filter(sector => sector.id !== sectorId),
          isOperationComplete: true
        }));
        
        get().handleSearch(get().searchTerm);
        
        toast.success(translateFunction('sectorDeleted') || 'Sektor silindi', {
          description: translateFunction('sectorDeletedDesc') || 'Sektor uğurla silindi'
        });
        
        return true;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Sektor silinməsi xətası:', err);
      
      toast.error(translateFunction('errorOccurred') || 'Xəta baş verdi', {
        description: err.message || translateFunction('couldNotDeleteSector') || 'Sektor silinə bilmədi'
      });
      
      return false;
    }
  },
  
  setIsOperationComplete: (value: boolean) => {
    set({ isOperationComplete: value });
  }
}));

const filterSectors = (sectors: Sector[], searchTerm: string, status: string | null): Sector[] => {
  return sectors.filter(sector => {
    const matchesSearch = !searchTerm || 
      sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sector.description && sector.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sector.adminEmail && sector.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = !status || sector.status === status;
    
    return matchesSearch && matchesStatus;
  });
};

const sortSectors = (sectors: Sector[], sortConfig: SortConfig): Sector[] => {
  return [...sectors].sort((a: any, b: any) => {
    if (sortConfig.key === 'adminEmail') {
      if (a.adminEmail === null && b.adminEmail === null) return 0;
      if (a.adminEmail === null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (b.adminEmail === null) return sortConfig.direction === 'asc' ? -1 : 1;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};
