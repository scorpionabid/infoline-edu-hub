
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsStore } from '@/hooks/useRegionsStore';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { RegionDialog } from '@/components/regions/RegionDialog';
import { RegionAdminDialog } from '@/components/regions/RegionAdminDialog';
import { ExistingUserAdminDialog } from '@/components/regions/ExistingUserAdminDialog'; 
import RegionHeader from '@/components/regions/RegionHeader';
import RegionTable from '@/components/regions/RegionTable';
import { EnhancedRegion } from '@/hooks/useRegionsStore';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { Pagination } from '@/components/ui/pagination';

const Regions = () => {
  const { t } = useLanguage();
  const {
    regions,
    loading,
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
    fetchRegions
  } = useRegionsStore();

  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [openExistingUserDialog, setOpenExistingUserDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<EnhancedRegion | null>(null);
  const [createdRegion, setCreatedRegion] = useState<any>(null);
  
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
    fetchRegions();
    setCreatedRegion(null);
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
        await handleAddRegion({
          name: values.name,
          description: values.description,
          status: values.status,
        });
        toast.success(t('regionCreated'));
      }
      
      setOpenRegionDialog(false);
      setSelectedRegion(null);
      fetchRegions();
    } catch (error: any) {
      console.error('Region yaradılarkən/yenilənərkən xəta:', error);
      toast.error(t('errorOccurred'), {
        description: error.message || t('unexpectedError')
      });
    }
  };

  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('regions')} | InfoLine</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
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
          onSuccess={handleRegionCreated}
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
    </SidebarLayout>
  );
};

export default Regions;
