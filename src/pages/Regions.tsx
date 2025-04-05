
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsStore } from '@/hooks/useRegionsStore';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { RegionDialog } from '@/components/regions/RegionDialogs';
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

  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<EnhancedRegion | null>(null);

  const handleOpenDialog = useCallback((region: EnhancedRegion | null) => {
    setSelectedRegion(region);
    setOpen(true);
  }, []);

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
      
      setOpen(false);
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
          onAddRegion={() => handleOpenDialog(null)}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusFilter}
          onResetFilters={resetFilters}
        />
        
        <RegionTable
          regions={regions}
          loading={loading}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteRegion}
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
          open={open}
          setOpen={setOpen}
          selectedRegion={selectedRegion}
          onSubmit={handleFormSubmit}
        />
      </div>
    </SidebarLayout>
  );
};

export default Regions;
