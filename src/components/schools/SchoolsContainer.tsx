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
import { School as MockSchool } from '@/data/schoolsData';

interface MappedSchool {
  id: string;
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  status: string;
  type: string;
  language: string;
  adminEmail: string;
}

// Supabase Məktəb tipindən mock Məktəb tipinə çevirmək üçün yardımçı funksiya
const mapToMockSchool = (school: School): MappedSchool => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principal_name || '',
    address: school.address || '',
    regionId: school.region_id,
    sectorId: school.sector_id,
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.student_count || 0,
    teacherCount: school.teacher_count || 0,
    status: school.status || 'active',
    type: school.type || '',
    language: school.language || '',
    adminEmail: school.admin_email || ''
  };
};

// Çevrilmiş məktəb tipini School tipinə (data/schoolsData.ts) çevirmək üçün funksiya
const convertToSchoolType = (school: School): MockSchool => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principal_name || '',
    address: school.address || '',
    regionId: school.region_id,
    sectorId: school.sector_id,
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.student_count || 0,
    teacherCount: school.teacher_count || 0,
    status: school.status || 'active',
    type: school.type || '',
    language: school.language || '',
    createdAt: school.created_at,
    completionRate: school.completion_rate,
    region: '',  // Bu məlumatlar yaradılanda əlavə olunacaq
    sector: '',  // Bu məlumatlar yaradılanda əlavə olunacaq
    logo: school.logo || '',
    adminEmail: school.admin_email || ''
  };
};

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
        student_count: formData.studentCount ? Number(formData.studentCount) : null,
        teacher_count: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null,
        logo: null
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
  }, [formData, validateForm, addSchool, closeAddDialog, setIsOperationComplete]);

  // Handle Edit Dialog
  const handleEditDialogOpen = useCallback((school: School) => {
    const mappedSchool = mapToMockSchool(school);
    
    setFormDataFromSchool({
      name: mappedSchool.name,
      principalName: mappedSchool.principalName || '',
      regionId: mappedSchool.regionId,
      sectorId: mappedSchool.sectorId,
      address: mappedSchool.address || '',
      email: mappedSchool.email || '',
      phone: mappedSchool.phone || '',
      studentCount: mappedSchool.studentCount?.toString() || '',
      teacherCount: mappedSchool.teacherCount?.toString() || '',
      status: mappedSchool.status || 'active',
      type: mappedSchool.type || '',
      language: mappedSchool.language || '',
      adminEmail: mappedSchool.adminEmail || '',
      adminFullName: '', // Bu məlumat mövcud deyil
      adminPassword: '',
      adminStatus: 'active'
    });
    openEditDialog(convertToSchoolType(school));
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
        student_count: formData.studentCount ? Number(formData.studentCount) : null,
        teacher_count: formData.teacherCount ? Number(formData.teacherCount) : null,
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
  }, [formData, selectedSchool, validateForm, updateSchool, closeEditDialog, setIsOperationComplete]);

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
    openAdminDialog(convertToSchoolType(school));
  }, [openAdminDialog]);

  const handleAdminUpdate = useCallback(() => {
    toast.success("Admin məlumatları yeniləndi");
    closeAdminDialog();
    setIsOperationComplete(true);
  }, [closeAdminDialog]);

  const handleResetPassword = useCallback((newPassword: string) => {
    if (!selectedAdmin) return;
    
    const adminEmail = selectedAdmin.adminEmail;
    
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

  // Sektorları uyğun tipə çevirmək
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
            handleDeleteDialogOpen={(school: School) => openDeleteDialog(convertToSchoolType(school))}
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
        filteredSectors={mappedSectors}
      />
      
      <EditDialog 
        isOpen={isEditDialogOpen} 
        onClose={closeEditDialog} 
        onSubmit={handleEditSubmit} 
        formData={formData} 
        handleFormChange={handleFormChange} 
        filteredSectors={mappedSectors}
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
