import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Region } from '@/hooks/regions/useRegions';

export interface EnhancedRegion extends Region {
  adminName?: string;
  adminEmail?: string;
  sectorCount?: number;
  schoolCount?: number;
}

interface RegionsState {
  regions: EnhancedRegion[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedStatus: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Filtreleme və paginasiya metodları
  handleSearch: (term: string) => void;
  handleStatusFilter: (status: string) => void;
  handlePageChange: (page: number) => void;
  resetFilters: () => void;
  
  // CRUD əməliyyatları
  fetchRegions: (t?: (key: string) => string) => Promise<EnhancedRegion[]>;
  getRegionById: (id: string) => EnhancedRegion | undefined;
  handleAddRegion: (regionData: Partial<Region>, t?: (key: string) => string) => Promise<EnhancedRegion>;
  handleUpdateRegion: (id: string, regionData: Partial<Region>, t?: (key: string) => string) => Promise<EnhancedRegion>;
  handleDeleteRegion: (id: string, t?: (key: string) => string) => Promise<boolean>;
}

export const useRegionsStore = create<RegionsState>((set, get) => ({
  regions: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedStatus: '',
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  
  // Filtreleme metodu
  handleSearch: (term: string) => {
    set({ searchTerm: term, currentPage: 1 });
  },
  
  // Status filtreləmə
  handleStatusFilter: (status: string) => {
    set({ selectedStatus: status, currentPage: 1 });
  },
  
  // Səhifə dəyişdirmə
  handlePageChange: (page: number) => {
    set({ currentPage: page });
  },
  
  // Filtrləri sıfırla
  resetFilters: () => {
    set({ 
      searchTerm: '', 
      selectedStatus: '', 
      currentPage: 1 
    });
  },
  
  // Bütün regionları əldə et
  fetchRegions: async (t) => {
    try {
      set({ loading: true, error: null });
      
      // Regionları əldə etmək
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*');
        
      if (regionsError) {
        const errorMessage = t 
          ? t('errorLoadingRegions') 
          : 'Failed to load regions';
        
        set({ error: errorMessage, loading: false });
        throw regionsError;
      }
        
      // Əlavə məlumatları əldə etmək
      const enhancedRegions: EnhancedRegion[] = await Promise.all(
        (regionsData || []).map(async (region) => {
          // Sektorların sayını əldə etmək
          const { count: sectorCount } = await supabase
            .from('sectors')
            .select('id', { count: 'exact' })
            .eq('region_id', region.id);
            
          // Məktəblərin sayını əldə etmək
          const { count: schoolCount } = await supabase
            .from('schools')
            .select('id', { count: 'exact' })
            .eq('region_id', region.id);
            
          // Admin məlumatlarını əldə etmək
          let adminName;
          let adminEmail;
          
          if (region.admin_id) {
            const { data: adminData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', region.admin_id)
              .single();
              
            if (adminData) {
              adminName = adminData.full_name;
              adminEmail = adminData.email;
            }
          }
          
          return {
            ...region,
            adminName,
            adminEmail,
            sectorCount: sectorCount || 0,
            schoolCount: schoolCount || 0
          };
        })
      );
        
      // Regionları adlarına görə sırala
      enhancedRegions.sort((a, b) => a.name.localeCompare(b.name));
      
      // Ümumi səhifə sayını hesablayırıq
      const filteredRegions = applyFilters(enhancedRegions);
      const totalPages = Math.ceil(filteredRegions.length / get().pageSize);
        
      set({ 
        regions: enhancedRegions, 
        totalPages: totalPages || 1,
        loading: false 
      });
        
      return enhancedRegions;
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta baş verdi:', err);
      set({ error: String(err), loading: false });
      return [];
    }
  },
  
  // ID ilə region əldə etmək
  getRegionById: (id: string) => {
    return get().regions.find(region => region.id === id);
  },
  
  // Region yaratmaq
  handleAddRegion: async (regionData: Partial<Region>, t) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Yeni yaradılan regionu əlavə məlumatları ilə birlikdə geri qaytarırıq
      const enhancedRegion: EnhancedRegion = {
        ...data,
        adminName: undefined,
        adminEmail: undefined,
        sectorCount: 0,
        schoolCount: 0
      };
      
      // State'i yeniləyirik
      set(state => ({
        regions: [...state.regions, enhancedRegion],
        loading: false
      }));
      
      const successMessage = t 
        ? t('regionCreatedSuccessfully') 
        : 'Region created successfully';
        
      toast.success(successMessage);
      return enhancedRegion;
    } catch (err: any) {
      console.error('Region yaradılarkən xəta:', err);
      set({ loading: false });
      const errorMessage = t 
        ? t('errorCreatingRegion') 
        : 'Error creating region';
        
      toast.error(errorMessage);
      throw err;
    }
  },
  
  // Region yeniləmək
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
      
      // Mövcud regionun əlavə məlumatlarını qorumalıyıq
      const existingRegion = get().regions.find(r => r.id === id);
      const enhancedRegion: EnhancedRegion = {
        ...data,
        adminName: existingRegion?.adminName,
        adminEmail: existingRegion?.adminEmail,
        sectorCount: existingRegion?.sectorCount || 0,
        schoolCount: existingRegion?.schoolCount || 0
      };
      
      // State'i yeniləyirik
      set(state => ({
        regions: state.regions.map(region => (region.id === id ? enhancedRegion : region)),
        loading: false
      }));
      
      const successMessage = t 
        ? t('regionUpdatedSuccessfully') 
        : 'Region updated successfully';
        
      toast.success(successMessage);
      return enhancedRegion;
    } catch (err: any) {
      console.error('Region yenilənərkən xəta:', err);
      set({ loading: false });
      const errorMessage = t 
        ? t('errorUpdatingRegion') 
        : 'Error updating region';
        
      toast.error(errorMessage);
      throw err;
    }
  },
  
  // Region silmək
  handleDeleteRegion: async (id: string, t) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Region silindi, state'i yeniləyirik
      set(state => ({
        regions: state.regions.filter(region => region.id !== id),
        loading: false
      }));
      
      const successMessage = t 
        ? t('regionDeletedSuccessfully') 
        : 'Region deleted successfully';
        
      toast.success(successMessage);
      return true;
    } catch (err: any) {
      console.error('Region silinərkən xəta:', err);
      set({ loading: false });
      const errorMessage = t 
        ? t('errorDeletingRegion') 
        : 'Error deleting region';
        
      toast.error(errorMessage);
      throw err;
    }
  }
}));

// Filtreləmə funksiyası
function applyFilters(regions: EnhancedRegion[], searchTerm = '', selectedStatus = '') {
  return regions.filter(region => {
    const matchesSearch = searchTerm
      ? region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = selectedStatus
      ? region.status === selectedStatus
      : true;

    return matchesSearch && matchesStatus;
  });
}
