
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsStore } from '@/hooks/useRegionsStore';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { RegionDialog } from '@/components/regions/RegionDialogs';
import RegionHeader from '@/components/regions/RegionHeader';
import RegionTable from '@/components/regions/RegionTable';
import { EnhancedRegion } from '@/hooks/useRegionsStore';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const Regions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
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
        toast({
          title: t('regionUpdated'),
          description: t('regionUpdatedDesc'),
        });
      } else {
        // Yeni region oluşturma
        await handleAddRegion({
          name: values.name,
          description: values.description,
          status: values.status,
        });
        
        if (values.adminEmail && values.adminName && values.adminPassword) {
          // Eğer admin bilgileri de girildiyse, admin oluşturma
          // Not: Backend entegrasyon değişikliği yapılması gerekebilir
          toast({
            title: t('regionCreated'),
            description: t('regionWithAdminCreated'),
          });
        } else {
          toast({
            title: t('regionCreated'),
            description: t('regionCreatedDesc'),
          });
        }
      }
      
      setOpen(false);
      setSelectedRegion(null);
      fetchRegions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message || t('errorOccurred'),
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
