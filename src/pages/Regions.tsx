import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsStore } from '@/hooks/regions/useRegionsStore';
import { RegionDialog } from '@/components/regions/RegionDialog';
import { RegionAdminDialog } from '@/components/regions/RegionAdminDialog';
import { ExistingUserAdminDialog } from '@/components/regions/ExistingUserAdminDialog'; 
import RegionHeader from '@/components/regions/RegionHeader';
import RegionTable from '@/components/regions/RegionTable';
import { EnhancedRegion } from '@/types/region';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Initial fetch and refresh listener
  useEffect(() => {
    // Initial data fetch
    const initFetch = async () => {
      console.log('Initial fetch of regions...');
      try {
        await fetchRegions();
      } catch (error) {
        console.error('Error fetching regions:', error);
        toast.error(t('errorFetchingRegions'));
      }
    };
    
    initFetch();
    
    // Listen for refresh events
    const handleRefreshRegions = () => {
      console.log('refresh-regions event received, refreshing regions...');
      setRefreshTrigger(prev => prev + 1);
    };
    
    document.addEventListener('refresh-regions', handleRefreshRegions);
    return () => {
      document.removeEventListener('refresh-regions', handleRefreshRegions);
    };
  }, [fetchRegions, t]);
  
  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`Refreshing regions due to trigger change (${refreshTrigger})...`);
      fetchRegions();
    }
  }, [refreshTrigger, fetchRegions]);

  const handleOpenRegionDialog = useCallback((region: EnhancedRegion | null) => {
    setSelectedRegion(region);
    setOpenRegionDialog(true);
  }, []);

  // Open admin assignment dialogs
  const handleOpenAdminDialog = useCallback((region: EnhancedRegion, method: 'new' | 'existing' = 'existing') => {
    console.log('Opening admin dialog for region:', region.name, 'Method:', method);
    setSelectedRegion(region);
    
    if (method === 'existing') {
      setOpenExistingUserDialog(true);
    } else {
      setOpenAdminDialog(true);
    }
  }, []);

  const handleRegionCreated = (region: any) => {
    console.log('Region created:', region);
    setCreatedRegion(region);
    setOpenExistingUserDialog(true); // Choose existing user as admin
  };

  const handleAdminAssigned = async () => {
    console.log('Admin assigned, refreshing regions...');
    await fetchRegions();
    setCreatedRegion(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedRegion) {
        // Update existing region
        console.log('Updating region:', values);
        await handleUpdateRegion(selectedRegion.id, {
          name: values.name,
          description: values.description,
          status: values.status,
        });
        toast.success(t('regionUpdated'));
      } else {
        // Create new region
        console.log('Creating new region:', values);
        const newRegion = await handleAddRegion({
          name: values.name,
          description: values.description,
          status: values.status,
        });
        toast.success(t('regionCreated'));
        
        // If admin should be added
        if (values.addAdmin) {
          handleRegionCreated(newRegion);
          return;
        }
      }
      
      setOpenRegionDialog(false);
      setSelectedRegion(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error with region operation:', error);
      toast.error(t('errorOccurred'), {
        description: error.message || t('unexpectedError')
      });
    }
  };

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
      
      {openRegionDialog && (
        <RegionDialog
          open={openRegionDialog}
          onOpenChange={setOpenRegionDialog}
          initialData={{
            name: selectedRegion?.name || '',
            description: selectedRegion?.description || '',
            status: selectedRegion?.status || 'active',
          }}
          onSave={handleFormSubmit}
          title={selectedRegion ? t('edit_region') : t('add_region')}
        />
      )}

      {/* New User Admin Dialog */}
      {openAdminDialog && selectedRegion && selectedRegion.id && (
        <RegionAdminDialog
          open={openAdminDialog}
          onClose={() => setOpenAdminDialog(false)}
          regionId={selectedRegion.id}
          onSuccess={handleAdminAssigned}
        />
      )}

      {/* Existing User Admin Dialog */}
      {openExistingUserDialog && (selectedRegion || createdRegion) && (
        <ExistingUserAdminDialog
          open={openExistingUserDialog}
          setOpen={setOpenExistingUserDialog}
          region={selectedRegion || createdRegion!}
          onSuccess={handleAdminAssigned}
        />
      )}
    </div>
  );
};

export default Regions;
