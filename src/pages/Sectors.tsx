
import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import { SectorDialog } from '@/components/sectors/SectorDialog';
import { SectorAdminDialog } from '@/components/sectors/SectorAdminDialog';
import SectorHeader from '@/components/sectors/SectorHeader';
import SectorTable from '@/components/sectors/SectorTable';
import { EnhancedSector } from '@/hooks/useSectorsStore';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { Pagination } from '@/components/ui/pagination';
import { useSectors } from '@/hooks/sectors/useSectors'; // Direkt useSectors hook-unu istifadə edək

const Sectors = () => {
  const { t } = useLanguage();
  const {
    sectors: storeSectors,
    loading: storeLoading,
    searchTerm,
    selectedRegion,
    selectedStatus,
    currentPage,
    totalPages,
    handleSearch,
    handleRegionFilter,
    handleStatusFilter,
    handlePageChange,
    resetFilters,
    handleAddSector,
    handleUpdateSector,
    handleDeleteSector,
    fetchSectors: fetchSectorsStore
  } = useSectorsStore();

  // Əlavə olaraq birbaşa useSectors hook-dan istifadə edək
  const { sectors: directSectors, loading: directLoading, error: directError, fetchSectors: directFetchSectors, refresh: refreshDirectSectors } = useSectors();
  
  // DirectSectors var ama storeSectors yoxdursa, store sectors-u yeniləyək
  useEffect(() => {
    if (directSectors?.length > 0 && (!storeSectors || storeSectors.length === 0)) {
      console.log('Direct sectors var, store sectors-u yeniləyirəm...');
      fetchSectorsStore();
    }
  }, [directSectors, storeSectors, fetchSectorsStore]);

  const [openSectorDialog, setOpenSectorDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [selectedSector, setSelectedSector] = useState<EnhancedSector | null>(null);
  const [createdSector, setCreatedSector] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // DirectSectors və ya storeSectors istifadə edək - hangisi daha məlumatldırsa
  const sectors = storeSectors?.length > 0 ? storeSectors : directSectors || [];
  const loading = storeLoading || directLoading;

  // Yeniləmə triggerini izlə
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Sektorlar siyahısı yenilənir...');
      fetchSectorsStore();
      refreshDirectSectors();
    }
  }, [refreshTrigger, fetchSectorsStore, refreshDirectSectors]);

  useEffect(() => {
    // Component yükləndikdə sektorları yükləyək
    directFetchSectors();
  }, [directFetchSectors]);

  // Document event ilə yeniləmə trigger
  useEffect(() => {
    const handleRefreshSectors = () => {
      console.log('refresh-sectors event alındı, sektorlar yenilənir...');
      setRefreshTrigger(prev => prev + 1);
    };
    
    document.addEventListener('refresh-sectors', handleRefreshSectors);
    
    return () => {
      document.removeEventListener('refresh-sectors', handleRefreshSectors);
    };
  }, []);

  const handleOpenSectorDialog = useCallback((sector: EnhancedSector | null) => {
    setSelectedSector(sector);
    if (sector) {
      setOpenEditDialog(true);
    } else {
      setOpenSectorDialog(true);
    }
  }, []);

  const handleOpenDeleteDialog = useCallback((sector: EnhancedSector) => {
    setSelectedSector(sector);
    setOpenDeleteDialog(true);
  }, []);

  const handleOpenAdminDialog = useCallback((sector: EnhancedSector) => {
    setSelectedSector(sector);
    setOpenAdminDialog(true);
  }, []);

  const handleSectorCreated = (sector: any) => {
    setCreatedSector(sector);
    setOpenAdminDialog(true);
  };

  const handleAdminAssigned = () => {
    console.log('handleAdminAssigned çağırıldı');
    // Sektorlar listini yenidən yüklə
    setRefreshTrigger(prev => prev + 1);
    setCreatedSector(null);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedSector) {
        // Sektor güncelleme
        await handleUpdateSector(selectedSector.id, {
          name: values.name,
          description: values.description,
          region_id: values.region_id,
          status: values.status,
        });
        toast.success(t('sectorUpdated'));
      } else {
        // Yeni sektor oluşturma
        const sector = await handleAddSector({
          name: values.name,
          description: values.description,
          region_id: values.region_id,
          status: values.status,
        });
        toast.success(t('sectorCreated'));
        
        // Admin əlavə etmək istəyirsə, dialoqunu aç
        if (values.addAdmin) {
          handleSectorCreated(sector);
          return;
        }
      }
      
      setOpenSectorDialog(false);
      setSelectedSector(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(t('errorOccurred'), {
        description: error.message || t('unexpectedError')
      });
    }
  };

  if (directError) {
    console.error('Direct sectors yükləyərkən xəta:', directError);
  }

  // Əgər hər iki mənbə boş nəticə qaytarırsa və yükləmə başa çatıbsa
  if (!loading && sectors.length === 0) {
    console.warn('Sektorlar boşdur! Supabase-də sektor məlumatlarını və RLS siyasətlərini yoxlayın.');
  }

  return (
    <>
      <Helmet>
        <title>{t('sectors')} | InfoLine</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <SectorHeader
          onAddSector={() => handleOpenSectorDialog(null)}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionFilter}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusFilter}
          onResetFilters={resetFilters}
        />
        
        <SectorTable
          sectors={sectors}
          loading={loading}
          onEdit={handleOpenSectorDialog}
          onDelete={handleOpenDeleteDialog}
          onAssignAdmin={handleOpenAdminDialog}
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
        
        <SectorDialog
          open={openSectorDialog}
          onClose={() => setOpenSectorDialog(false)}
          onSubmit={handleFormSubmit}
        />
        
        {selectedSector && (
          <SectorDialog
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
            sector={selectedSector}
            onSubmit={handleFormSubmit}
          />
        )}
        
        {selectedSector && (
          <SectorDialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            sector={selectedSector}
            isDeleteDialog={true}
            onSubmit={async () => {
              await handleDeleteSector(selectedSector.id);
              setOpenDeleteDialog(false);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
        
        <SectorAdminDialog
          open={openAdminDialog}
          setOpen={setOpenAdminDialog}
          sector={selectedSector}
          createdSector={createdSector}
          onAdminAssigned={handleAdminAssigned}
        />
      </div>
    </>
  );
};

export default Sectors;
