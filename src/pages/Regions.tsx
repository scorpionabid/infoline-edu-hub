
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsStore } from '@/hooks/useRegionsStore';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { RegionDialog } from '@/components/regions/RegionDialog';
import { RegionAdminDialog } from '@/components/regions/RegionAdminDialog';
import { ExistingUserAdminDialog } from '@/components/regions/ExistingUserAdminDialog'; // Yeni dialog
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
  const [openExistingUserDialog, setOpenExistingUserDialog] = useState(false); // Yeni state
  const [selectedRegion, setSelectedRegion] = useState<EnhancedRegion | null>(null);
  const [createdRegion, setCreatedRegion] = useState<any>(null);
  const [adminAssignMethod, setAdminAssignMethod] = useState<'new' | 'existing'>('existing'); // Admin təyin etmə metodu

  const handleOpenRegionDialog = useCallback((region: EnhancedRegion | null) => {
    setSelectedRegion(region);
    setOpenRegionDialog(true);
  }, []);

  // Admin təyin etmə dialoqlarını açmaq
  const handleOpenAdminDialog = useCallback((region: EnhancedRegion, method: 'new' | 'existing' = 'existing') => {
    setSelectedRegion(region);
    setAdminAssignMethod(method);
    
    // Metoda görə fərqli dialoqları aç
    if (method === 'existing') {
      setOpenExistingUserDialog(true);
    } else {
      setOpenAdminDialog(true);
    }
  }, []);

  const handleRegionCreated = (region: any) => {
    setCreatedRegion(region);
    // Burada istifadəçiyə admin təyin etmə metodunu soruşa bilərik
    // və ya birbaşa təyin etmə edə bilərik
    setOpenExistingUserDialog(true); // Varsayılan olaraq mövcud istifadəçilərdən seçim
  };

  const handleAdminAssigned = () => {
    fetchRegions();
    setCreatedRegion(null);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedRegion) {
        // Region güncelleme
        await handleUpdateRegion(selectedRegion.id, {
          name: values.name,
          description: values.description,
          status: values.status,
        });
        toast.success(t('regionUpdated'));
      } else {
        // Yeni region oluşturma
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
          onAssignAdmin={(region) => handleOpenAdminDialog(region, 'existing')} // Varsayılan metod dəyişdirildi
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
        <RegionAdminDialog
          open={openAdminDialog}
          setOpen={setOpenAdminDialog}
          region={createdRegion || selectedRegion}
          onSuccess={handleAdminAssigned}
        />
        
        {/* Yeni admin təyin etmə dialoqu - mövcud istifadəçilərdən seçim üçün */}
        <ExistingUserAdminDialog
          open={openExistingUserDialog}
          setOpen={setOpenExistingUserDialog}
          region={createdRegion || selectedRegion}
          onSuccess={handleAdminAssigned}
        />
      </div>
    </SidebarLayout>
  );
};

export default Regions;
