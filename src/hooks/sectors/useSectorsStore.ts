import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { useRegions } from '@/hooks/regions/useRegions';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export const useSectorsStore = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t } = useLanguageSafe();
  const user = useAuthStore(selectUser);
  const { userRole, regionId } = usePermissions();
  
  const isFetchingRef = useRef(false);
  const prevFiltersRef = useRef({
    region: '',
    status: '',
    userRole: '',
    regionId: ''
  });
  
  const { regions = [], loading: regionsLoading } = useRegions() || {};

  const fetchSectors = useCallback(async (forceRefresh = false) => {
    const currentFilters = {
      region: selectedRegion,
      status: selectedStatus,
      userRole: userRole || '',
      regionId: regionId || ''
    };
    
    if (!forceRefresh && (
      isFetchingRef.current || 
      JSON.stringify(currentFilters) === JSON.stringify(prevFiltersRef.current)
    )) {
      console.log("Sektorlar hələ yüklənir və ya filtrlər dəyişməyib");
      return;
    }
    
    prevFiltersRef.current = { ...currentFilters };
    isFetchingRef.current = true;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("🏢 Sektorlar yüklənir...");
      console.log("👤 İstifadəçi rolu:", userRole);
      console.log("🌍 Region ID:", regionId);
      
      let query = supabase.from('sectors').select('*');
      
      if (userRole === 'regionadmin' && regionId) {
        console.log("🔒 Region admin filtri tətbiq olunur:", regionId);
        query = query.eq('region_id', regionId);
      } else {
        if (selectedRegion) {
          console.log("🔍 Region filtri tətbiq olunur:", selectedRegion);
          query = query.eq('region_id', selectedRegion);
        }
      }
      
      if (selectedStatus) {
        console.log("🔍 Status filtri tətbiq olunur:", selectedStatus);
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error("❌ Supabase sorğu xətası:", error);
        throw error;
      }
      
      console.log("✅ Sektorlar yükləndi:", data?.length || 0);
      setSectors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('❌ Error fetching sectors:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSectors')
      });
      setSectors([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }
  }, [selectedRegion, selectedStatus, t, userRole, regionId]);

  const createSector = useCallback(async (sectorData: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSectorData = {
        name: sectorData.name,
        region_id: sectorData.region_id,
        description: sectorData.description || null,
        status: sectorData.status || 'active'
      };

      const { data, error } = await supabase
        .from('sectors')
        .insert([newSectorData])
        .select()
        .single();

      if (error) throw error;

      toast.success(t('sectorCreated'));
      fetchSectors(true);
      return data;
    } catch (err: any) {
      console.error('Error creating sector:', err);
      toast.error(t('sectorCreationFailed'));
      throw err;
    }
  }, [fetchSectors, t]);

  const updateSector = useCallback(async (id: string, sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update({
          ...sectorData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('sectorUpdated'));
      fetchSectors(true);
      return data;
    } catch (err: any) {
      console.error('Error updating sector:', err);
      toast.error(t('sectorUpdateFailed'));
      throw err;
    }
  }, [fetchSectors, t]);

  const deleteSector = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('sectorDeleted'));
      fetchSectors(true);
    } catch (err: any) {
      console.error('Error deleting sector:', err);
      toast.error(t('sectorDeletionFailed'));
      throw err;
    }
  }, [fetchSectors, t]);

  const filteredSectors = sectors.filter(sector => {
    if (!sector) return false;
    
    const searchMatch = searchTerm
      ? (sector.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (sector.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
      : true;
    
    return searchMatch;
  });

  const sortedSectors = [...filteredSectors].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const key = sortConfig.key as keyof Sector;
    const aValue = a[key] as any;
    const bValue = b[key] as any;
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
    if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedSectors.length / itemsPerPage);
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages > 0 ? totalPages : 1));
  const indexOfLastItem = adjustedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSectors.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (userRole === 'regionadmin' && regionId) {
      setSelectedRegion(regionId);
    }
  }, [userRole, regionId]);

  useEffect(() => {
    if (user && !isFetchingRef.current) {
      fetchSectors(true);
    }
  }, [user, userRole, regionId]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handlePageChange = useCallback((page: number) => {
    if (page > 0 && page <= (totalPages > 0 ? totalPages : 1)) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    
    if (userRole !== 'regionadmin') {
      setSelectedRegion('');
    }
    
    setSelectedStatus('');
    setCurrentPage(1);
  }, [userRole]);

  return {
    sectors,
    loading: loading || regionsLoading,
    error,
    searchTerm,
    selectedRegion,
    selectedStatus,
    sortConfig,
    currentPage: currentPage,
    itemsPerPage,
    filteredSectors,
    sortedSectors,
    currentItems,
    totalPages: totalPages > 0 ? totalPages : 1,
    regions,
    handleSearch,
    handleRegionFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSectors,
    createSector,
    updateSector,
    deleteSector,
    setSectors,
    userRole
  };
};
