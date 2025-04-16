
import React, { useEffect, useMemo, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { useSchoolsStore, SortConfig } from '@/hooks/schools/useSchoolsStore';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import SchoolDialogs from './SchoolDialogs';
import { toast } from 'sonner';
import ImportDialog from './ImportDialog';
import { useImportExport } from '@/hooks/schools/useImportExport';
import { UserRole } from '@/types/supabase';
import { School, adaptSchoolFromSupabase, adaptSchoolToSupabase } from '@/types/school';

const SchoolsContainer: React.FC = () => {
  const {
    currentItems: supabaseCurrentItems,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sectors,
    regions,
    sortConfig,
    currentPage,
    totalPages,
    handleSearch: originalHandleSearch,
    handleRegionFilter: originalHandleRegionFilter,
    handleSectorFilter: originalHandleSectorFilter,
    handleStatusFilter: originalHandleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools,
    isOperationComplete,
    setIsOperationComplete,
    schools: supabaseSchools,
    userRole
  } = useSchoolsStore();

  // Supabase School tipini App School tipinə çeviririk
  const schools = useMemo(() => supabaseSchools.map(adaptSchoolFromSupabase), [supabaseSchools]);
  const currentItems = useMemo(() => supabaseCurrentItems.map(adaptSchoolFromSupabase), [supabaseCurrentItems]);

  // Change event handler adaptörleri
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => originalHandleSearch(e);
  const handleRegionFilter = (e: ChangeEvent<HTMLSelectElement>) => originalHandleRegionFilter(e);
  const handleSectorFilter = (e: ChangeEvent<HTMLSelectElement>) => originalHandleSectorFilter(e);
  const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => originalHandleStatusFilter(e);

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
    handleEditDialogOpen: handleEditDialogOpenOriginal,
    handleDeleteDialogOpen: handleDeleteDialogOpenOriginal,
    handleAdminDialogOpen: handleAdminDialogOpenOriginal,
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

  // Supabase və app School tipləri arasında adapter funksiyaları
  const handleEditDialogOpen = (school: School) => {
    handleEditDialogOpenOriginal(adaptSchoolToSupabase(school) as any);
  };

  const handleDeleteDialogOpen = (school: School) => {
    handleDeleteDialogOpenOriginal(adaptSchoolToSupabase(school) as any);
  };

  const handleAdminDialogOpen = (school: School) => {
    handleAdminDialogOpenOriginal(adaptSchoolToSupabase(school) as any);
  };

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

  // İstifadəçinin roluna əsasən sektorları filtrləmək
  const filteredSectors = useMemo(() => {
    let sectorsList = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.region_id
    }));
    
    // Əvvəlcə userRole'un düzgün tipə uyğun olduğunu yoxlayaq
    const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    const userRoleTyped: UserRole | null = userRole && validRoles.includes(userRole as UserRole) 
      ? (userRole as UserRole) 
      : null;
    
    // Sektor admin üçün yalnız öz sektorunu göstərmək
    if (userRoleTyped === 'sectoradmin') {
      sectorsList = sectorsList.filter(sector => sector.id === selectedSector);
    }
    // Region admin üçün yalnız öz regionuna aid sektorları göstərmək
    else if (userRoleTyped === 'regionadmin' && selectedRegion) {
      sectorsList = sectorsList.filter(sector => sector.regionId === selectedRegion);
    }
    
    return sectorsList;
  }, [sectors, userRole, selectedSector, selectedRegion]);

  // Excel ixrac və idxal funksiyaları
  const handleExportClick = () => {
    // Burada supabase tipindən app tipinə çevirmək əvəzinə, 
    // birbaşa supabase tipi göndərək
    handleExportToExcel(supabaseSchools);
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  // UserRole tipini təhlükəsizləşdirmək üçün əlavə düzəliş
  const safeUserRole = useMemo(() => {
    const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    return validRoles.includes(userRole as UserRole) ? 
           (userRole as Extract<UserRole, 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin'>) : 
           'schooladmin';
  }, [userRole]);

  return (
    <div className="space-y-6">
      <SchoolHeader 
        userRole={safeUserRole} 
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
            sortConfig={sortConfig as SortConfig}
            handleSort={handleSort}
            handleEditDialogOpen={handleEditDialogOpen}
            handleDeleteDialogOpen={handleDeleteDialogOpen}
            handleAdminDialogOpen={handleAdminDialogOpen}
            userRole={userRole as UserRole}
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
