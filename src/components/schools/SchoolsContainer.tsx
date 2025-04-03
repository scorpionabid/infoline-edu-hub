import React, { useEffect, useMemo, useState, ChangeEvent } from 'react';
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
import { School } from '@/types/school';

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
    handleFormChange,
    setFormData,
  } = useSchoolDialogHandlers();

  const {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  } = useImportExport(() => setIsOperationComplete(true));

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  };

  useEffect(() => {
    if (isOperationComplete) {
      fetchSchools();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchools, setIsOperationComplete]);

  const filteredSectors = useMemo(() => {
    let sectorsList = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.region_id
    }));
    
    if (user && (user.role === 'regionadmin' || user.role === 'schooladmin') && user.regionId) {
      sectorsList = sectorsList.filter(sector => sector.regionId === user.regionId);
    }
    
    return sectorsList;
  }, [sectors, user]);

  useEffect(() => {
    if (user && user.regionId && selectedRegion !== user.regionId) {
      handleRegionFilter(user.regionId);
    }
  }, [user, selectedRegion, handleRegionFilter]);

  const handleExportClick = () => {
    const exportSchools = schools?.map(school => ({ 
      ...school,
      region_id: school.regionId || school.region_id,
      sector_id: school.sectorId || school.sector_id
    })) || [];
    
    handleExportToExcel(exportSchools as any);
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  const regionsForFilters: RegionType[] = regions as unknown as RegionType[];
  const userRole = user?.role as UserRole;

  const handleEditDialogOpenWrapper = (school: any) => {
    handleEditDialogOpen(school as School);
  };
  
  const handleDeleteDialogOpenWrapper = (school: any) => {
    handleDeleteDialogOpen(school as School);
  };
  
  const handleAdminDialogOpenWrapper = (school: any) => {
    handleAdminDialogOpen(school as School);
  };
  
  const handleAdminUpdateWrapper = (adminData: any) => {
    if (typeof adminData === 'object' && adminData !== null) {
      handleAdminUpdate(adminData);
    }
  };

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
            handleSearch={handleSearchChange}
            handleRegionFilter={handleRegionFilter}
            handleSectorFilter={handleSectorFilter}
            handleStatusFilter={handleStatusFilter}
            resetFilters={resetFilters}
          />
          
          <SchoolTable 
            currentItems={currentItems as any}
            searchTerm={searchTerm}
            sortConfig={sortConfig || { key: '', direction: 'ascending' }}
            handleSort={handleSort}
            handleEditDialogOpen={handleEditDialogOpenWrapper}
            handleDeleteDialogOpen={handleDeleteDialogOpenWrapper}
            handleAdminDialogOpen={handleAdminDialogOpenWrapper}
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
        selectedSchool={selectedSchool as School}
        selectedAdmin={selectedAdmin}
        closeDeleteDialog={closeDeleteDialog}
        closeEditDialog={closeEditDialog}
        closeAddDialog={closeAddDialog}
        closeAdminDialog={closeAdminDialog}
        handleDeleteConfirm={() => handleDeleteConfirm()}
        handleAddSubmit={handleAddSubmit}
        handleEditSubmit={(data) => handleEditSubmit(data)}
        handleAdminUpdate={handleAdminUpdateWrapper}
        handleResetPassword={handleResetPassword}
        formData={formData}
        handleFormChange={handleInputChange}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        filteredSectors={filteredSectors}
      />
      
      <ImportDialog 
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportSchools}
      />
    </div>
  );
};

export default SchoolsContainer;
