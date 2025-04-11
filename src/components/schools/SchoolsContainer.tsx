
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { useSchoolsStore } from '@/hooks/schools/useSchoolsStore';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import SchoolDialogs from './SchoolDialogs';
import { toast } from 'sonner';
import ImportDialog from './ImportDialog';
import { useImportExport } from '@/hooks/schools/useImportExport';
import { UserRole } from '@/types/supabase';
import { Region } from '@/types/region';
import { School, convertSupabaseToSchool } from '@/data/schoolsData';

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

  // useImportExport hook'unu uyğun parametrlərlə çağıraq
  const importExportHook = useImportExport(() => setIsOperationComplete(true));
  const {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  } = importExportHook;

  useEffect(() => {
    if (isOperationComplete) {
      // Əgər lazımsa, parametrlərlə fetchSchools çağıra bilərik
      fetchSchools(selectedRegion, selectedSector, selectedStatus);
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchools, setIsOperationComplete, selectedRegion, selectedSector, selectedStatus]);

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

  // Excel ixrac funksiyası
  const handleExportClick = () => {
    // Tip uyğunluğu üçün SupabaseSchool -> School konvertasiyası
    const schoolsForExport = schools.map(school => convertSupabaseToSchool(school));
    handleExportToExcel(schoolsForExport);
  };

  // Excel idxal funksiyası
  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  // Adapter funksiyalar
  const handleAdminUpdateAdapter = (userData: any) => {
    handleAdminUpdate(userData);
  };

  const handleResetPasswordAdapter = (newPassword: string) => {
    handleResetPassword(selectedAdmin?.id || '', newPassword);
  };

  // ImportDialog komponentini uyğunlaşdıraq
  const handleImportConfirm = (file: File) => {
    // ImportDialog funksiyasını çağırarkən bu adapter funksiyasını istifadə edirik
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
            regions={regions as Region[]}
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
