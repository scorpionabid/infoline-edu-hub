
import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsStore } from '@/hooks/useRegionsStore';
import { RegionDialog } from '@/components/regions/RegionDialog';
import { RegionAdminDialog } from '@/components/regions/RegionAdminDialog';
import { ExistingUserAdminDialog } from '@/components/regions/ExistingUserAdminDialog'; 
import RegionHeader from '@/components/regions/RegionHeader';
import RegionTable from '@/components/regions/RegionTable';
import { EnhancedRegion } from '@/hooks/useRegionsStore';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { Pagination } from '@/components/ui/pagination';
import { useRegions } from '@/hooks/regions/useRegions';

const Regions = () => {
  const { t } = useLanguage();
  const {
    regions: storeRegions,
    loading: storeLoading,
    searchTerm,
    selectedStatus,
    currentPage,
    totalPages,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    resetFilters,
    handleAddRegion,
    handleUpdateRegion,
    handleDeleteRegion,
    fetchRegions: fetchRegionsStore
  } = useRegionsStore();

  // Əlavə olaraq birbaşa useRegions hook-dan istifadə edək
  const { regions: directRegions, loading: directLoading, error: directError, fetchRegions: directFetchRegions, refresh: refreshDirectRegions } = useRegions();
  
  // DirectRegions var ama storeRegions yoxdursa, store regions-u yeniləyək
  useEffect(() => {
    if (directRegions?.length > 0 && (!storeRegions || storeRegions.length === 0)) {
      console.log('Direct regions var, store regions-u yeniləyirəm...');
      fetchRegionsStore();
    }
  }, [directRegions, storeRegions, fetchRegionsStore]);

  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [openExistingUserDialog, setOpenExistingUserDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<EnhancedRegion | null>(null);
  const [createdRegion, setCreatedRegion] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // DirectRegions və ya storeRegions istifadə edək - hangisi daha məlumatldırsa
  const regions = storeRegions?.length > 0 ? storeRegions : directRegions || [];
  const loading = storeLoading || directLoading;
  
  // Yeniləmə triggerini izlə
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Regionlar siyahısı yenilənir...');
      fetchRegionsStore();
      refreshDirectRegions();
    }
  }, [refreshTrigger, fetchRegionsStore, refreshDirectRegions]);

  useEffect(() => {
    // Component yükləndikdə regionları yükləyək
    try {
      directFetchRegions();
    } catch (error) {
      console.error('Regions yüklənərkən xəta baş verdi:', error);
      toast.error('Regionlar yüklənərkən xəta baş verdi');
    }
  }, [directFetchRegions]);
  
  // Document event ilə yeniləmə trigger
  useEffect(() => {
    const handleRefreshRegions = () => {
      console.log('refresh-regions event alındı, regionlar yenilənir...');
      setRefreshTrigger(prev => prev + 1);
    };
    
    document.addEventListener('refresh-regions', handleRefreshRegions);
    
    return () => {
      document.removeEventListener('refresh-regions', handleRefreshRegions);
    };
  }, []);

  const handleOpenRegionDialog = useCallback((region: EnhancedRegion | null) => {
    setSelectedRegion(region);
    setOpenRegionDialog(true);
  }, []);

  // Admin təyin etmə dialoqlarını açmaq
  const handleOpenAdminDialog = useCallback((region: EnhancedRegion, method: 'new' | 'existing' = 'existing') => {
    console.log('Admin təyin etmə, Region:', region, 'Method:', method);
    setSelectedRegion(region);
    
    // Metoda görə fərqli dialoqları aç
    if (method === 'existing') {
      setOpenExistingUserDialog(true);
    } else {
      setOpenAdminDialog(true);
    }
  }, []);

  const handleRegionCreated = (region: any) => {
    console.log('Region yaradıldı:', region);
    setCreatedRegion(region);
    setOpenExistingUserDialog(true); // Mövcud istifadəçilərdən seçim
  };

  const handleAdminAssigned = () => {
    console.log('Admin təyin edildi, regionları yeniləyirəm');
    fetchRegionsStore();
    directFetchRegions();
    setCreatedRegion(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedRegion) {
        // Region güncelleme
        console.log('Region yenilənir:', values);
        await handleUpdateRegion(selectedRegion.id, {
          name: values.name,
          description: values.description,
          status: values.status,
        });
        toast.success(t('regionUpdated'));
      } else {
        // Yeni region oluşturma
        console.log('Yeni region yaradılır:', values);
        const newRegion = await handleAddRegion({
          name: values.name,
          description: values.description,
          status: values.status,
        });
        toast.success(t('regionCreated'));
        
        // Admin əlavə etmək istəyirsə
        if (values.addAdmin) {
          handleRegionCreated(newRegion);
          return;
        }
      }
      
      setOpenRegionDialog(false);
      setSelectedRegion(null);
      // Hər iki məlumat mənbəyini yeniləyək
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Region yaradılarkən/yenilənərkən xəta:', error);
      toast.error(t('errorOccurred'), {
        description: error.message || t('unexpectedError')
      });
    }
  };

  if (directError) {
    console.error('Direct regions yükləyərkən xəta:', directError);
  }

  // Əgər hər iki mənbə boş nəticə qaytarırsa və yükləmə başa çatıbsa
  if (!loading && regions.length === 0) {
    console.warn('Regionlar boşdur! Supabase-də region məlumatlarını və RLS siyasətlərini yoxlayın.');
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>{t('regions')} | InfoLine</title>
      </Helmet>
      
      <RegionHeader
        onAddRegion={() => handleOpenRegionDialog(null)}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusFilter}
        onResetFilters={resetFilters}
      />
      
      <RegionTable
        regions={regions}
        loading={loading}
        onEdit={handleOpenRegionDialog}
        onDelete={handleDeleteRegion}
        onAssignAdmin={(region) => handleOpenAdminDialog(region, 'existing')}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            previousLabel={t('previous')}
            nextLabel={t('next')}
            pageLabel={(page) => `${page} ${t('of')} ${totalPages}`}
          />
        </div>
      )}
      
      <RegionDialog
        open={openRegionDialog}
        setOpen={setOpenRegionDialog}
        selectedRegion={selectedRegion}
        onSubmit={handleFormSubmit}
      />
      
      {/* Köhnə admin təyin etmə dialoqu - yeni admin yaratmaq üçün */}
      {openAdminDialog && (
        <RegionAdminDialog
          open={openAdminDialog}
          setOpen={setOpenAdminDialog}
          region={createdRegion || selectedRegion}
          onSuccess={handleAdminAssigned}
        />
      )}
      
      {/* Mövcud istifadəçilərdən seçim üçün admin təyin etmə dialoqu */}
      {openExistingUserDialog && (
        <ExistingUserAdminDialog
          open={openExistingUserDialog}
          setOpen={setOpenExistingUserDialog}
          region={createdRegion || selectedRegion}
          onSuccess={handleAdminAssigned}
        />
      )}
    </div>
  );
};

export default Regions;
