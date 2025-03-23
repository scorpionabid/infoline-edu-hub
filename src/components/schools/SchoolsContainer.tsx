
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { mockRegions, mockSectors, School, SchoolFormData } from '@/data/schoolsData';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { DeleteDialog, EditDialog, AddDialog, AdminDialog } from './SchoolDialogs';
import { useSchoolsData } from '@/hooks/useSchoolsData';
import { useSchoolForm, getInitialFormState } from '@/hooks/useSchoolForm';
import { useSchoolDialogs } from '@/hooks/useSchoolDialogs';

const SchoolsContainer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Custom hooks
  const {
    schools,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    filteredSectors,
    sortConfig,
    currentPage,
    currentItems,
    totalPages,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    handleAddSchool,
    handleUpdateSchool,
    handleDeleteSchool
  } = useSchoolsData();
  
  const {
    formData,
    currentTab,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm
  } = useSchoolForm();
  
  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    openDeleteDialog,
    closeDeleteDialog,
    openEditDialog,
    closeEditDialog,
    openAddDialog,
    closeAddDialog,
    openAdminDialog,
    closeAdminDialog
  } = useSchoolDialogs();

  // Handle Add Dialog
  const handleAddDialogOpen = () => {
    resetForm();
    openAddDialog();
  };

  const handleAddSubmit = () => {
    if (!validateForm()) return;
    
    const newSchool: School = {
      id: (schools.length + 1).toString(),
      ...formData,
      studentCount: Number(formData.studentCount) || 0,
      teacherCount: Number(formData.teacherCount) || 0,
      createdAt: new Date().toISOString().split('T')[0],
      completionRate: 0,
      region: mockRegions.find(r => r.id === formData.regionId)?.name || '',
      sector: mockSectors.find(s => s.id === formData.sectorId)?.name || '',
      logo: '',
      adminEmail: formData.adminEmail || ''
    };
    
    handleAddSchool(newSchool);
    closeAddDialog();
    
    if (formData.adminEmail) {
      toast.success('Məktəb admini uğurla yaradıldı');
    }
  };

  // Handle Edit Dialog
  const handleEditDialogOpen = (school: School) => {
    setFormDataFromSchool(school);
    openEditDialog(school);
  };

  const handleEditSubmit = () => {
    if (!validateForm() || !selectedSchool) return;
    
    const updatedSchool: School = { 
      ...selectedSchool, 
      ...formData,
      studentCount: Number(formData.studentCount) || 0,
      teacherCount: Number(formData.teacherCount) || 0,
      region: mockRegions.find(r => r.id === formData.regionId)?.name || '',
      sector: mockSectors.find(s => s.id === formData.sectorId)?.name || ''
    };
    
    handleUpdateSchool(updatedSchool);
    closeEditDialog();
  };

  // Handle Delete Dialog
  const handleDeleteConfirm = () => {
    if (!selectedSchool) return;
    handleDeleteSchool(selectedSchool.id);
    closeDeleteDialog();
  };

  // Handle Admin Dialog
  const handleAdminDialogOpen = (school: School) => {
    openAdminDialog(school);
  };

  const handleAdminUpdate = () => {
    toast.success('Admin məlumatları yeniləndi');
    closeAdminDialog();
  };

  const handleResetPassword = (newPassword: string) => {
    if (!selectedAdmin) return;
    
    const adminEmail = selectedAdmin.adminEmail;
    
    toast.success(`${adminEmail} üçün yeni parol təyin edildi`, {
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək."
    });
    
    closeAdminDialog();
  };

  // Excel operations
  const handleExport = () => {
    toast.success('Excel faylı yüklənir...');
  };

  const handleImport = () => {
    toast.success('Excel faylından məlumatlar yükləndi');
  };

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
            filteredSectors={filteredSectors}
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
            handleDeleteDialogOpen={openDeleteDialog}
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
      
      <DeleteDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={closeDeleteDialog} 
        onConfirm={handleDeleteConfirm} 
      />
      
      <AddDialog 
        isOpen={isAddDialogOpen} 
        onClose={closeAddDialog} 
        onSubmit={handleAddSubmit} 
        formData={formData} 
        handleFormChange={handleFormChange} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        filteredSectors={filteredSectors}
      />
      
      <EditDialog 
        isOpen={isEditDialogOpen} 
        onClose={closeEditDialog} 
        onSubmit={handleEditSubmit} 
        formData={formData} 
        handleFormChange={handleFormChange} 
        filteredSectors={filteredSectors}
      />
      
      <AdminDialog 
        isOpen={isAdminDialogOpen} 
        onClose={closeAdminDialog} 
        onUpdate={handleAdminUpdate} 
        onResetPassword={handleResetPassword} 
        selectedAdmin={selectedAdmin} 
      />
    </div>
  );
};

export default SchoolsContainer;
