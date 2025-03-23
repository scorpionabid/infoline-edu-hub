
import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { mockRegions, mockSectors, School } from '@/data/schoolsData';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { DeleteDialog, EditDialog, AddDialog, AdminDialog } from './SchoolDialogs';
import { useSchoolsData } from '@/hooks/useSchoolsData';
import { useSchoolForm } from '@/hooks/useSchoolForm';
import { useSchoolDialogs } from '@/hooks/useSchoolDialogs';
import { toast } from '@/hooks/use-toast';

const SchoolsContainer: React.FC = () => {
  const { user } = useAuth();
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  
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
    handleDeleteSchool,
    refreshData
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

  // Məlumatların yenilənməsini təmin etmək üçün effect
  useEffect(() => {
    if (isOperationComplete) {
      refreshData();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, refreshData]);

  // Handle Add Dialog
  const handleAddDialogOpen = useCallback(() => {
    resetForm();
    openAddDialog();
  }, [resetForm, openAddDialog]);

  const handleAddSubmit = useCallback(() => {
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
    
    closeAddDialog();
    handleAddSchool(newSchool);
    
    if (formData.adminEmail) {
      toast({
        title: "Məktəb admini uğurla yaradıldı",
        variant: "default",
      });
    }
    
    setIsOperationComplete(true);
    // Daha uzun gecikmə ilə məlumatları yeniləyək
    setTimeout(() => {
      refreshData();
    }, 300);
  }, [formData, schools.length, validateForm, handleAddSchool, closeAddDialog, refreshData]);

  // Handle Edit Dialog
  const handleEditDialogOpen = useCallback((school: School) => {
    setFormDataFromSchool(school);
    openEditDialog(school);
  }, [setFormDataFromSchool, openEditDialog]);

  const handleEditSubmit = useCallback(() => {
    if (!validateForm() || !selectedSchool) return;
    
    const updatedSchool: School = { 
      ...selectedSchool, 
      ...formData,
      studentCount: Number(formData.studentCount) || 0,
      teacherCount: Number(formData.teacherCount) || 0,
      region: mockRegions.find(r => r.id === formData.regionId)?.name || '',
      sector: mockSectors.find(s => s.id === formData.sectorId)?.name || ''
    };
    
    closeEditDialog();
    handleUpdateSchool(updatedSchool);
    
    setIsOperationComplete(true);
    // Daha uzun gecikmə ilə məlumatları yeniləyək
    setTimeout(() => {
      refreshData();
    }, 300);
  }, [formData, selectedSchool, validateForm, handleUpdateSchool, closeEditDialog, refreshData]);

  // Handle Delete Dialog
  const handleDeleteConfirm = useCallback(() => {
    if (!selectedSchool) return;
    
    closeDeleteDialog();
    handleDeleteSchool(selectedSchool.id);
    
    setIsOperationComplete(true);
    // Daha uzun gecikmə ilə məlumatları yeniləyək
    setTimeout(() => {
      refreshData();
    }, 300);
  }, [selectedSchool, handleDeleteSchool, closeDeleteDialog, refreshData]);

  // Handle Admin Dialog
  const handleAdminDialogOpen = useCallback((school: School) => {
    openAdminDialog(school);
  }, [openAdminDialog]);

  const handleAdminUpdate = useCallback(() => {
    toast({
      title: "Admin məlumatları yeniləndi",
      variant: "default",
    });
    closeAdminDialog();
    
    setIsOperationComplete(true);
    // Daha uzun gecikmə ilə məlumatları yeniləyək
    setTimeout(() => {
      refreshData();
    }, 300);
  }, [closeAdminDialog, refreshData]);

  const handleResetPassword = useCallback((newPassword: string) => {
    if (!selectedAdmin) return;
    
    const adminEmail = selectedAdmin.adminEmail;
    
    toast({
      title: `${adminEmail} üçün yeni parol təyin edildi`,
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək.",
      variant: "default",
    });
    
    closeAdminDialog();
    
    setIsOperationComplete(true);
    // Daha uzun gecikmə ilə məlumatları yeniləyək
    setTimeout(() => {
      refreshData();
    }, 300);
  }, [selectedAdmin, closeAdminDialog, refreshData]);

  // Excel operations
  const handleExport = useCallback(() => {
    toast({
      title: "Excel faylı yüklənir...",
      variant: "default",
    });
    refreshData();
  }, [refreshData]);

  const handleImport = useCallback(() => {
    toast({
      title: "Excel faylından məlumatlar yükləndi",
      variant: "default",
    });
    refreshData();
  }, [refreshData]);

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
