
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  TableBody
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useRegionsStore } from '@/hooks/useRegionsStore';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { EnhancedRegion } from '@/types/region';

// Import refactored components
import RegionHeader from '@/components/regions/RegionHeader';
import RegionFilters from '@/components/regions/RegionFilters';
import RegionTableHeader from '@/components/regions/RegionTableHeader';
import RegionTableRow from '@/components/regions/RegionTableRow';
import LoadingState from '@/components/regions/LoadingState';
import EmptyState from '@/components/regions/EmptyState';
import RegionPagination from '@/components/regions/RegionPagination';
import AddRegionDialog from '@/components/regions/AddRegionDialog';
import DeleteRegionDialog from '@/components/regions/DeleteRegionDialog';

const Regions: React.FC = () => {
  const { t } = useLanguage();
  const {
    filteredRegions: regions,
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
    fetchRegions,
    handleAddRegion: storeHandleAddRegion,
    handleDeleteRegion: storeHandleDeleteRegion,
    setIsOperationComplete
  } = useRegionsStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<EnhancedRegion | null>(null);

  const fetchRegionsWithTranslation = useCallback(() => {
    fetchRegions(t);
  }, [fetchRegions, t]);

  const handleRegionDelete = useCallback((region: EnhancedRegion) => {
    setSelectedRegion(region);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const handleRegionView = useCallback((region: EnhancedRegion) => {
    toast.info(t('viewingRegion'), { description: region.name });
  }, [t]);

  const handleRegionEdit = useCallback((region: EnhancedRegion) => {
    toast.info(t('editingRegion'), { description: region.name });
  }, [t]);
  
  const handleAddRegionClick = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const handleAddRegion = useCallback(async (formData) => {
    console.log("Add Region Dialog-dan formData:", formData);
    return await storeHandleAddRegion(formData, t);
  }, [storeHandleAddRegion, t]);

  const handleDeleteRegion = useCallback(async (regionId) => {
    return await storeHandleDeleteRegion(regionId, t);
  }, [storeHandleDeleteRegion, t]);

  useEffect(() => {
    fetchRegionsWithTranslation();
  }, [fetchRegionsWithTranslation]);

  useEffect(() => {
    if (isOperationComplete) {
      fetchRegionsWithTranslation();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchRegionsWithTranslation, setIsOperationComplete]);

  return (
    <div className="p-6 space-y-6">
      <RegionHeader t={t} onAddRegion={handleAddRegionClick} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('manageRegions')}</CardTitle>
          <CardDescription>{t('manageRegionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegionFilters 
            t={t}
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            handleSearch={handleSearch}
            handleStatusFilter={handleStatusFilter}
            resetFilters={resetFilters}
          />

          <div className="rounded-md border">
            <Table>
              <RegionTableHeader 
                t={t}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
              <TableBody>
                {loading ? (
                  <LoadingState t={t} />
                ) : regions.length === 0 ? (
                  <EmptyState t={t} onAddRegion={handleAddRegionClick} />
                ) : (
                  regions.map((region) => (
                    <RegionTableRow
                      key={region.id}
                      region={region}
                      t={t}
                      onView={handleRegionView}
                      onEdit={handleRegionEdit}
                      onDelete={handleRegionDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && 
            <RegionPagination
              t={t}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          }
        </CardContent>
      </Card>

      <AddRegionDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddRegion}
      />

      <DeleteRegionDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        region={selectedRegion}
        onDelete={handleDeleteRegion}
      />
    </div>
  );
};

export default Regions;
