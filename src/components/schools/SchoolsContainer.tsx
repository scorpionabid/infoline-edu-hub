
import React, { useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { useSchoolsStore } from '@/hooks/schools/useSchoolsStore';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import SchoolDialogs from './SchoolDialogs';

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

  // İstifadəçinin regionuna əsasən sektorları filtirləyirik
  const filteredSectors = useMemo(() => {
    let sectorsList = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.region_id
    }));
    
    // Əgər regionadmin və ya schooladmin-dirsə, yalnız öz regionuna aid sektorları göstər
    if (user && (user.role === 'regionadmin' || user.role === 'schooladmin') && user.regionId) {
      sectorsList = sectorsList.filter(sector => sector.regionId === user.regionId);
    }
    
    return sectorsList;
  }, [sectors, user]);

  // Avtomatik olaraq istifadəçinin regionuna aid sektorlarla filtrələyirik
  useEffect(() => {
    if (user && user.regionId && selectedRegion !== user.regionId) {
      handleRegionFilter(user.regionId);
    }
  }, [user, selectedRegion, handleRegionFilter]);

  return (
    <div className="space-y-6">
      <SchoolHeader 
        userRole={user?.role} 
        onAddClick={handleAddDialogOpen}
      />
      
      <Card>
        <CardContent className="p-6">
          <SchoolFilters 
            searchTerm={searchTerm}
            selectedRegion={selectedRegion}
            selectedSector={selectedSector}
            selectedStatus={selectedStatus}
            filteredSectors={filteredSectors}
            regions={regions}
            handleSearch={handleSearch}
            handleRegionFilter={handleRegionFilter}
            handleSectorFilter={handleSectorFilter}
            handleStatusFilter={handleStatusFilter}
            resetFilters={resetFilters}
            isSuperAdmin={user?.role === 'superadmin'}
          />
          
          <SchoolTable 
            schools={currentItems}
            loading={false}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleEditClick={handleEditDialogOpen}
            handleDeleteClick={handleDeleteDialogOpen}
            handleAdminClick={handleAdminDialogOpen}
            userRole={user?.role}
          />
          
          {totalPages > 1 && (
            <SchoolPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
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
        filteredSectors={filteredSectors}
      />
    </div>
  );
};

export default SchoolsContainer;
