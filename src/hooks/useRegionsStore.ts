
// Bu kod blokunun tərkibi hooks/useRegionsStore.ts üzərində işləmək üçün istifadə olunur
// Burada regionlar üçün state və CRUD funksiyaları təmin edilir

// Əsas interfeyslər və tiplərin təyin edilməsi
export interface RegionFormData {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  adminName?: string;
  adminEmail?: string; 
}

export interface EnhancedRegion {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  sectorCount: number;
  schoolCount: number;
  adminEmail?: string;
  adminId?: string;
  completionRate: number;
  created_at?: string;
  updated_at?: string;
}

// State tipi
interface RegionsState {
  regions: EnhancedRegion[];
  loading: boolean;
  searchTerm: string;
  selectedStatus: string | null;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  currentPage: number;
  regionsPerPage: number;
}

// Sorting və filtering funksiyaları
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Region } from '@/types/supabase';
import { useRegions } from '@/hooks/useRegions';

export const useRegionsStore = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const regionsPerPage = 10;

  // Regions hook
  const { 
    regions: originalRegions, 
    loading, 
    addRegion: apiAddRegion, 
    updateRegion: apiUpdateRegion,
    deleteRegion: apiDeleteRegion,
    fetchRegions: refreshRegions
  } = useRegions();

  // Mock region data with enhanced fields
  const enhancedRegions: EnhancedRegion[] = useMemo(() => {
    return originalRegions.map(region => ({
      ...region,
      sectorCount: Math.floor(Math.random() * 10) + 1, // Mock data
      schoolCount: Math.floor(Math.random() * 50) + 5, // Mock data
      adminEmail: `${region.name.toLowerCase().replace(/\s+/g, '.')}@infoline.edu`, // Mock admin email
      adminId: `user-${region.id}`, // Mock admin ID
      completionRate: Math.floor(Math.random() * 100), // Mock completion rate
    }));
  }, [originalRegions]);

  // Filter regions based on search and status
  const filteredRegions = useMemo(() => {
    return enhancedRegions.filter(region => {
      const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (region.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || region.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [enhancedRegions, searchTerm, selectedStatus]);

  // Sort filtered regions
  const sortedRegions = useMemo(() => {
    const sortableRegions = [...filteredRegions];
    return sortableRegions.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRegions, sortConfig]);

  // Paginate sorted regions
  const paginatedRegions = useMemo(() => {
    const startIndex = (currentPage - 1) * regionsPerPage;
    return sortedRegions.slice(startIndex, startIndex + regionsPerPage);
  }, [sortedRegions, currentPage, regionsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => Math.ceil(sortedRegions.length / regionsPerPage), [sortedRegions, regionsPerPage]);

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus(null);
    setCurrentPage(1);
  };

  // CRUD operations
  const handleAddRegion = async (formData: RegionFormData) => {
    try {
      // Create region with admin if specified
      const regionData: Omit<Region, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name,
        description: formData.description || '',
        status: formData.status
      };
      
      await apiAddRegion(regionData);
      
      // In a real implementation, we would create an admin user here

      return true;
    } catch (error) {
      console.error('Region əlavə etmə xətası:', error);
      toast.error('Region əlavə edilərkən xəta baş verdi');
      return false;
    }
  };

  const handleUpdateRegion = async (regionId: string, updates: Partial<RegionFormData>) => {
    try {
      // Map form data to Region type
      const regionUpdates: Partial<Region> = {
        name: updates.name,
        description: updates.description,
        status: updates.status
      };

      await apiUpdateRegion(regionId, regionUpdates);

      // In a real implementation, we would update admin user here if needed

      return true;
    } catch (error) {
      console.error('Region yeniləmə xətası:', error);
      toast.error('Region yenilərkən xəta baş verdi');
      return false;
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    try {
      await apiDeleteRegion(regionId);
      return true;
    } catch (error) {
      console.error('Region silmə xətası:', error);
      toast.error('Region silmə prosesində xəta baş verdi');
      return false;
    }
  };

  return {
    regions: paginatedRegions,
    loading,
    searchTerm,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages,
    handleSearch,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    handleAddRegion,
    handleUpdateRegion,
    handleDeleteRegion,
    fetchRegions: refreshRegions
  };
};
