
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { useSchoolsStore } from '@/hooks/schools/useSchoolsStore';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import SchoolDialogs from './SchoolDialogs';
import { useImportExport } from '@/hooks/schools/useImportExport';
import { useExportAdapter } from '@/hooks/schools/useExportAdapter';
import ImportDialog from './ImportDialog';
import { UserRole } from '@/types/supabase';

const SchoolsContainer: React.FC = () => {
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
    schools,
    userRole
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

  // useImportExport hook'unu çağıraq
  const importExportHook = useImportExport(() => setIsOperationComplete(true));
  const {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleImportSchools
  } = importExportHook;

  // Excel ixrac funksiyasını əldə etmək üçün adapter hook-u istifadə edək
  const { handleExportClick } = useExportAdapter(schools);

  useEffect(() => {
    if (isOperationComplete) {
      fetchSchools();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchools, setIsOperationComplete]);

  // İstifadəçinin roluna əsasən sektorları filtrləmək
  const filteredSectors = React.useMemo(() => {
    let sectorsList = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.region_id
    }));
    
    // UserRole tipində olduğunu yoxlayırıq
    const validUserRole = userRole as UserRole | undefined;
    
    // Sektor admin üçün yalnız öz sektorunu göstərmək
    if (validUserRole === 'sectoradmin') {
      sectorsList = sectorsList.filter(sector => sector.id === selectedSector);
    }
    // Region admin üçün yalnız öz regionuna aid sektorları göstərmək
    else if (validUserRole === 'regionadmin' && selectedRegion) {
      sectorsList = sectorsList.filter(sector => sector.regionId === selectedRegion);
    }
    
    return sectorsList;
  }, [sectors, userRole, selectedSector, selectedRegion]);

  // Excel idxal funksiyası
  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  // Adapter funksiyalar
  const handleAdminUpdateAdapter = () => {
    handleAdminUpdate();
  };

  const handleResetPasswordAdapter = (newPassword: string) => {
    handleResetPassword(selectedAdmin?.id || '', newPassword);
  };

  // ImportDialog komponentini uyğunlaşdıraq
  const handleImportConfirm = (file: File) => {
    handleImportSchools(file);
  };

  return (
    <div className="space-y-6">
      <SchoolHeader 
        userRole={userRole as UserRole | undefined} 
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
            regions={regions}
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
        handleAdminUpdate={handleAdminUpdateAdapter}
        handleResetPassword={handleResetPasswordAdapter}
        formData={formData}
        handleFormChange={handleFormChange}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        filteredSectors={filteredSectors}
      />
      
      <ImportDialog 
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportConfirm}
      />
    </div>
  );
};

export default SchoolsContainer;
