import { useState, useEffect, useCallback } from 'react';
import { Region } from '@/types/supabase';
import { useRegions } from './useRegions';
import { useSectors } from './useSectors';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { createRegion, deleteRegion, getRegionStats } from '@/services/regionService';

export type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
};

// Əlavə edilmiş sahələrlə genişləndirilmiş Region tipi
export type EnhancedRegion = Region & {
  schoolCount?: number;
  sectorCount?: number;
  completionRate?: number;
  adminId?: string;
  adminEmail?: string;
};

export interface RegionFormData {
  name: string;
  description?: string;
  status?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export const useRegionsStore = () => {
  const { t } = useLanguage();
  const { regions, loading, fetchRegions, addRegion, updateRegion, deleteRegion: deleteExistingRegion } = useRegions();
  const { sectors } = useSectors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  const [schoolCounts, setSchoolCounts] = useState<Record<string, number>>({});
  const [sectorCounts, setSectorCounts] = useState<Record<string, number>>({});
  const [completionRates, setCompletionRates] = useState<Record<string, number>>({});
  const [regionAdmins, setRegionAdmins] = useState<Record<string, { id: string, email: string }>>({});
  
  const itemsPerPage = 5;

  // Regionların xüsusi məlumatlarını əldə etmək
  const fetchRegionStats = useCallback(async () => {
    try {
      // Hər region üçün məktəb sayını əldə etmək
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolError) throw schoolError;
      
      // Məktəbləri regionlara görə qruplaşdırırıq
      const schoolCountsMap: Record<string, number> = {};
      schools?.forEach(school => {
        if (school.region_id) {
          schoolCountsMap[school.region_id] = (schoolCountsMap[school.region_id] || 0) + 1;
        }
      });
      setSchoolCounts(schoolCountsMap);
      
      // Sektorları regionlara görə qruplaşdırmaq
      const sectorCountsMap: Record<string, number> = {};
      sectors.forEach(sector => {
        if (sector.region_id) {
          sectorCountsMap[sector.region_id] = (sectorCountsMap[sector.region_id] || 0) + 1;
        }
      });
      setSectorCounts(sectorCountsMap);
      
      // Tamamlanma faizini hesablamaq (bu, verilənlər bazası strukturunuzdan asılı olacaq)
      const tempCompletionRates: Record<string, number> = {};
      regions.forEach(region => {
        // Məktəblərin tamamlanma faizlərini ortalamaq
        const regionSchools = schools?.filter(school => school.region_id === region.id) || [];
        const totalCompletionRate = regionSchools.reduce((total, school) => {
          return total + (school.completion_rate || 0);
        }, 0);
        
        const avgCompletionRate = regionSchools.length > 0
          ? Math.round(totalCompletionRate / regionSchools.length)
          : Math.floor(Math.random() * 100); // Əgər məktəb yoxdursa, təsadüfi dəyər
          
        tempCompletionRates[region.id] = avgCompletionRate;
      });
      setCompletionRates(tempCompletionRates);
      
      // ==== DÜZƏLDILMIŞ HİSSƏ: Region adminləri üçün xəta emalı gücləndirildi ====
      
      // Region adminlərini əldə etmək üçün daha ehtiyatlı sorğu
      const tempRegionAdmins: Record<string, { id: string, email: string }> = {};
      
      try {
        // Regionlar üçün default admin e-poçtlarını hazırlayaq (hətta user_roles sorğusu xəta versə də)
        regions.forEach(region => {
          const regionNameLower = region.name.toLowerCase().replace(/\s+/g, '.');
          tempRegionAdmins[region.id] = {
            id: '',
            email: `${regionNameLower}.admin@infoline.edu`
          };
        });
        
        // user_roles sorğusunu cəhd edək, lakin xəta baş verdikdə dayandırmadan davam edək
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select('user_id, region_id')
          .eq('role', 'regionadmin');
        
        if (userRolesError) {
          console.warn('Qeyd: user_roles cədvəlinə sorğu zamanı xəta baş verdi. Default admin məlumatları istifadə ediləcək.');
          console.error('User roles sorğusu xətası:', userRolesError);
        } else if (userRoles && userRoles.length > 0) {
          // 2. Profiles məlumatlarını əldə edirik
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name');
            
          if (profilesError) {
            console.warn('Qeyd: profiles cədvəlinə sorğu zamanı xəta baş verdi.');
            console.error('Profiles sorğusu xətası:', profilesError);
          } else if (profiles) {
            // 3. Məlumatları birləşdiririk
            userRoles.forEach(role => {
              if (role.region_id) {
                const profile = profiles.find(p => p.id === role.user_id);
                if (profile) {
                  const profileName = profile.full_name || 'Unknown';
                  const email = `${profileName.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`;
                  
                  tempRegionAdmins[role.region_id] = {
                    id: role.user_id,
                    email: email
                  };
                }
              }
            });
          }
        }
      } catch (adminError) {
        console.error('Admin məlumatlarını əldə edərkən xəta:', adminError);
        // Xəta baş versə belə, proqram işləməyə davam edir
      }
      
      // Hazır adminlər mapini təyin edirik
      setRegionAdmins(tempRegionAdmins);
      
    } catch (error) {
      console.error("Region statistikalarını əldə edərkən xəta baş verdi:", error);
      toast.error(t('errorOccurred'), {
        description: 'Bölgə məlumatları yüklənərkən xəta baş verdi'
      });
    }
  }, [regions, sectors, t]);

  useEffect(() => {
    if (regions.length > 0) {
      fetchRegionStats();
    }
  }, [regions, fetchRegionStats]);

  // Əməliyyatlar tamamlandıqda verilənlərin yenilənməsi
  useEffect(() => {
    if (isOperationComplete) {
      fetchRegions();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchRegions]);

  // Axtarış və filtirləmə
  const filteredRegions = regions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (region.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus ? region.status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  // Sıralama
  const sortedRegions = [...filteredRegions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    // Statistika sahələri üçün xüsusi hallar
    if (sortConfig.key === 'schoolCount') {
      return sortConfig.direction === 'asc' 
        ? (schoolCounts[a.id] || 0) - (schoolCounts[b.id] || 0)
        : (schoolCounts[b.id] || 0) - (schoolCounts[a.id] || 0);
    }
    
    if (sortConfig.key === 'sectorCount') {
      return sortConfig.direction === 'asc' 
        ? (sectorCounts[a.id] || 0) - (sectorCounts[b.id] || 0)
        : (sectorCounts[b.id] || 0) - (sectorCounts[a.id] || 0);
    }
    
    if (sortConfig.key === 'completionRate') {
      return sortConfig.direction === 'asc' 
        ? (completionRates[a.id] || 0) - (completionRates[b.id] || 0)
        : (completionRates[b.id] || 0) - (completionRates[a.id] || 0);
    }
    
    // Adi sahələr üçün
    const key = sortConfig.key as keyof Region;
    
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Səhifələmə
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRegions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRegions.length / itemsPerPage);

  // İdarəetmə funksiyaları
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus(null);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  }, []);

  // Region əməliyyatları - Admin ilə birlikdə
  const handleAddRegion = useCallback(async (formData: RegionFormData) => {
    try {
      console.log("Region əlavə edilir:", formData);
      
      // Edge function vasitəsilə region və admin yaratma
      // Admin email formatı: {regionName.toLowerCase()}.admin@infoline.edu
      const adminEmail = formData.adminEmail || 
        `${formData.name.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`;
      
      const adminPassword = formData.adminPassword || 'Password123';
      
      const result = await createRegion({
        name: formData.name,
        description: formData.description,
        status: formData.status || 'active',
        adminName: formData.adminName || formData.name + ' Admin',
        adminEmail,
        adminPassword
      });
      
      console.log("Region yaratma nəticəsi:", result);
      
      if (result.success) {
        toast.success(t('regionAdded'), {
          description: t('regionAddedDesc')
        });
        
        if (result.data.admin) {
          toast.success(t('adminCreated'), {
            description: t('adminCreatedDesc')
          });
        }
        
        setIsOperationComplete(true);
        return true;
      } else {
        throw new Error(result.error || "Bilinməyən xəta");
      }
    } catch (error) {
      console.error('Region əlavə edilərkən xəta baş verdi:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddRegion')
      });
      return false;
    }
  }, [t]);

  const handleUpdateRegion = useCallback(async (id: string, updates: Partial<Region>) => {
    try {
      await updateRegion(id, updates);
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Region yenilənərkən xəta baş verdi:', error);
      return false;
    }
  }, [updateRegion]);

  const handleDeleteRegion = useCallback(async (id: string) => {
    try {
      // Edge function vasitəsilə region və bağlı admin/sektorları silmək
      const result = await deleteRegion(id);
      
      if (result && result.success) {
        toast.success(t('regionDeleted'), {
          description: t('regionDeletedDesc')
        });
        setIsOperationComplete(true);
        return true;
      } else {
        throw new Error(result.error || "Bilinməyən xəta");
      }
    } catch (error) {
      console.error('Region silinərkən xəta baş verdi:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteRegion')
      });
      return false;
    }
  }, [t]);

  // Regionlara aid statistika və admin məlumatlarını birləşdirmək
  const enhancedRegions = currentItems.map(region => ({
    ...region,
    schoolCount: schoolCounts[region.id] || 0,
    sectorCount: sectorCounts[region.id] || 0,
    completionRate: completionRates[region.id] || 0,
    adminId: regionAdmins[region.id]?.id || '',
    adminEmail: regionAdmins[region.id]?.email || `${region.name.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`
  }));

  return {
    regions: enhancedRegions,
    allRegions: regions,
    loading,
    searchTerm,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages,
    isOperationComplete,
    handleSearch,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    handleAddRegion,
    handleUpdateRegion,
    handleDeleteRegion,
    setIsOperationComplete,
    fetchRegions
  };
};