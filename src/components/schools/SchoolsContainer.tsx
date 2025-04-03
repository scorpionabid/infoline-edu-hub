
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
import { useImportExport } from '@/hooks/schools/useImportExport';
import ImportDialog from './ImportDialog';
import { Region as RegionType } from '@/types/region';
import { UserRole } from '@/types/supabase';

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
    setIsOperationComplete,
    schools
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

  const {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  } = useImportExport(() => setIsOperationComplete(true));

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

  // Excel ixrac və idxal funksiyaları
  const handleExportClick = () => {
    handleExportToExcel(schools);
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  // Region array tipini açıq şəkildə dönüşdürürük
  const regionsForFilters: RegionType[] = regions as unknown as RegionType[];
  const userRole = user?.role as UserRole || undefined;

  return (
    <div className="space-y-6">
      <SchoolHeader 
        userRole={userRole}
        onAddClick={handleAddDialogOpen}
        onExportClick={handleExportClick}
        onImportClick={handleImportClick}
      />
      
      <Card>
        <CardContent className="p-6">
          <SchoolFilters 
            searchTerm={searchTerm}
            selectedRegion={selectedRegion}
            selectedSector={selectedSector}
            selectedStatus={selectedStatus}
            filteredSectors={filteredSectors}
            regions={regionsForFilters}
            handleSearch={handleSearch}
            handleRegionFilter={handleRegionFilter}
            handleSectorFilter={handleSectorFilter}
            handleStatusFilter={handleStatusFilter}
            resetFilters={resetFilters}
          />
          
          <SchoolTable 
            currentItems={currentItems}
            searchTerm={searchTerm}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleEditDialogOpen={handleEditDialogOpen}
            handleDeleteDialogOpen={handleDeleteDialogOpen}
            handleAdminDialogOpen={handleAdminDialogOpen}
            userRole={userRole}
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
        filteredSectors={filteredSectors}
      />
      
      {/* Import Dialog */}
      <ImportDialog 
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportSchools}
      />
    </div>
  );
};

export default SchoolsContainer;
