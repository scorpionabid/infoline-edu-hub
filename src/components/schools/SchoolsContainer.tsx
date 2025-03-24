
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { useSchoolsStore } from '@/hooks/schools/useSchoolsStore';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import SchoolDialogs from './SchoolDialogs';
import { toast } from 'sonner';
import { School } from '@/types/supabase';

const SchoolsContainer: React.FC = () => {
  const { user } = useAuth();
  const {
    currentItems,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sectors,
    regions,
    sortConfig,
    currentPage,
    totalPages,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools,
    isOperationComplete,
    setIsOperationComplete
  } = useSchoolsStore();

  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    closeDeleteDialog,
    closeEditDialog,
    openAddDialog,
    closeAddDialog,
    closeAdminDialog,
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleDeleteDialogOpen,
    handleAdminDialogOpen,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword,
    formData,
    currentTab,
    setCurrentTab,
    handleFormChange
  } = useSchoolDialogHandlers();

  useEffect(() => {
    if (isOperationComplete) {
      fetchSchools();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchools, setIsOperationComplete]);

  const handleExport = () => {
    toast.success("Excel faylı yüklənir...");
    fetchSchools();
  };

  const handleImport = () => {
    toast.success("Excel faylından məlumatlar yükləndi");
    fetchSchools();
  };

  const mappedSectors = sectors.map(sector => ({
    id: sector.id,
    name: sector.name,
    regionId: sector.region_id
  }));

  return (
    <div className="space-y-6">
      <SchoolHeader 
        userRole={user?.role} 
        onAddClick={handleAddDialogOpen}
        onExportClick={handleExport}
        onImportClick={handleImport}
      />
      
      <Card>
        <CardContent className="p-6">
          <SchoolFilters 
            searchTerm={searchTerm}
            selectedRegion={selectedRegion}
            selectedSector={selectedSector}
            selectedStatus={selectedStatus}
            filteredSectors={mappedSectors}
            regions={regions}
            handleSearch={handleSearch}
            handleRegionFilter={handleRegionFilter}
            handleSectorFilter={handleSectorFilter}
            handleStatusFilter={handleStatusFilter}
            resetFilters={resetFilters}
          />
          
          <SchoolTable
            currentItems={currentItems}
            userRole={user?.role}
            searchTerm={searchTerm}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleEditDialogOpen={handleEditDialogOpen}
            handleDeleteDialogOpen={handleDeleteDialogOpen}
            handleAdminDialogOpen={handleAdminDialogOpen}
          />
          
          {totalPages > 1 && (
            <SchoolPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </CardContent>
      </Card>
      
      <SchoolDialogs
        isDeleteDialogOpen={isDeleteDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isAddDialogOpen={isAddDialogOpen}
        isAdminDialogOpen={isAdminDialogOpen}
        selectedSchool={selectedSchool}
        selectedAdmin={selectedAdmin}
        closeDeleteDialog={closeDeleteDialog}
        closeEditDialog={closeEditDialog}
        closeAddDialog={closeAddDialog}
        closeAdminDialog={closeAdminDialog}
        handleDeleteConfirm={handleDeleteConfirm}
        handleAddSubmit={handleAddSubmit}
        handleEditSubmit={handleEditSubmit}
        handleAdminUpdate={handleAdminUpdate}
        handleResetPassword={handleResetPassword}
        formData={formData}
        handleFormChange={handleFormChange}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        filteredSectors={mappedSectors}
      />
    </div>
  );
};

export default SchoolsContainer;
