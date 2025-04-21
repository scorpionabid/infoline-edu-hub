
import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SectorDialog from '@/components/sectors/SectorDialog';
import { SectorAdminDialog } from '@/components/sectors/SectorAdminDialog';
import SectorHeader from '@/components/sectors/SectorHeader';
import SectorTable from '@/components/sectors/SectorTable';
import { EnhancedSector } from '@/hooks/useSectorsStore';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { Pagination } from '@/components/ui/pagination';

const Sectors = () => {
  const { t } = useLanguage();
  const {
    sectors,
    loading,
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
    fetchSectors
  } = useSectorsStore();

  const [openSectorDialog, setOpenSectorDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [selectedSector, setSelectedSector] = useState<EnhancedSector | null>(null);
  const [createdSector, setCreatedSector] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Yeniləmə triggerini izlə
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Sektorlar siyahısı yenilənir...');
      fetchSectors();
    }
  }, [refreshTrigger, fetchSectors]);

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
    setOpenSectorDialog(true);
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

  return (
    <SidebarLayout>
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
          onDelete={handleDeleteSector}
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
          isOpen={openSectorDialog}
          onClose={() => setOpenSectorDialog(false)}
          sector={selectedSector}
        />
        
        <SectorAdminDialog
          open={openAdminDialog}
          setOpen={setOpenAdminDialog}
          sector={createdSector || selectedSector}
          onSuccess={handleAdminAssigned}
        />
      </div>
    </SidebarLayout>
  );
};

export default Sectors;
