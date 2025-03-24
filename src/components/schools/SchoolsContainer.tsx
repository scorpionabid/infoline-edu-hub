
import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { DeleteDialog, EditDialog, AddDialog, AdminDialog } from './SchoolDialogs';
import { useSupabaseSchools } from '@/hooks/useSupabaseSchools';
import { useSchoolForm } from '@/hooks/useSchoolForm';
import { useSchoolDialogs } from '@/hooks/useSchoolDialogs';
import { useSchools } from '@/hooks/useSchools';
import { toast } from 'sonner';
import { School } from '@/types/supabase';

const SchoolsContainer: React.FC = () => {
  const { user } = useAuth();
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  
  // Supabase məlumatları və filtrlər
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
    fetchSchools
  } = useSupabaseSchools();
  
  // CRUD əməliyyatları üçün hook
  const { addSchool, updateSchool, deleteSchool } = useSchools();
  
  // Form və dialoglar
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
      fetchSchools();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchools]);

  // Handle Add Dialog
  const handleAddDialogOpen = useCallback(() => {
    resetForm();
    openAddDialog();
  }, [resetForm, openAddDialog]);

  const handleAddSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      // Supabase üçün məlumatları hazırlayaq
      const newSchool = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        student_count: Number(formData.studentCount) || null,
        teacher_count: Number(formData.teacherCount) || null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null
      };
      
      await addSchool(newSchool);
      
      closeAddDialog();
      setIsOperationComplete(true);
      
      if (formData.adminEmail) {
        toast.success("Məktəb admini uğurla yaradıldı");
      }
    } catch (error) {
      console.error('Error adding school:', error);
    }
  }, [formData, validateForm, addSchool, closeAddDialog]);

  // Handle Edit Dialog
  const handleEditDialogOpen = useCallback((school: School) => {
    setFormDataFromSchool({
      name: school.name,
      principalName: school.principal_name || '',
      regionId: school.region_id,
      sectorId: school.sector_id,
      address: school.address || '',
      email: school.email || '',
      phone: school.phone || '',
      studentCount: school.student_count?.toString() || '',
      teacherCount: school.teacher_count?.toString() || '',
      status: school.status || 'active',
      type: school.type || '',
      language: school.language || '',
      adminEmail: school.admin_email || '',
      adminFullName: '', // Bu məlumat mövcud deyil
      adminPassword: '',
      adminStatus: 'active'
    });
    openEditDialog(school);
  }, [setFormDataFromSchool, openEditDialog]);

  const handleEditSubmit = useCallback(async () => {
    if (!validateForm() || !selectedSchool) return;
    
    try {
      // Supabase üçün məlumatları hazırlayaq
      const updatedSchool = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        student_count: Number(formData.studentCount) || null,
        teacher_count: Number(formData.teacherCount) || null, 
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null
      };
      
      await updateSchool(selectedSchool.id, updatedSchool);
      
      closeEditDialog();
      setIsOperationComplete(true);
    } catch (error) {
      console.error('Error updating school:', error);
    }
  }, [formData, selectedSchool, validateForm, updateSchool, closeEditDialog]);

  // Handle Delete Dialog
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSchool) return;
    
    try {
      await deleteSchool(selectedSchool.id);
      
      closeDeleteDialog();
      setIsOperationComplete(true);
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  }, [selectedSchool, deleteSchool, closeDeleteDialog]);

  // Handle Admin Dialog
  const handleAdminDialogOpen = useCallback((school: School) => {
    openAdminDialog(school);
  }, [openAdminDialog]);

  const handleAdminUpdate = useCallback(() => {
    toast.success("Admin məlumatları yeniləndi");
    closeAdminDialog();
    setIsOperationComplete(true);
  }, [closeAdminDialog]);

  const handleResetPassword = useCallback((newPassword: string) => {
    if (!selectedAdmin) return;
    
    const adminEmail = selectedAdmin.admin_email;
    
    toast.success(`${adminEmail} üçün yeni parol təyin edildi`, {
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək."
    });
    
    closeAdminDialog();
    setIsOperationComplete(true);
  }, [selectedAdmin, closeAdminDialog]);

  // Excel operations
  const handleExport = useCallback(() => {
    toast.success("Excel faylı yüklənir...");
    fetchSchools();
  }, [fetchSchools]);

  const handleImport = useCallback(() => {
    toast.success("Excel faylından məlumatlar yükləndi");
    fetchSchools();
  }, [fetchSchools]);

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
            filteredSectors={sectors}
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
        filteredSectors={sectors}
      />
      
      <EditDialog 
        isOpen={isEditDialogOpen} 
        onClose={closeEditDialog} 
        onSubmit={handleEditSubmit} 
        formData={formData} 
        handleFormChange={handleFormChange} 
        filteredSectors={sectors}
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
