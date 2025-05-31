import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { School, Region, Sector } from '@/types/supabase';
import { useSchoolDialogs } from '@/hooks/schools/useSchoolDialogs';
import { useSchoolFilters } from '@/hooks/schools/useSchoolFilters';
import { useSchoolPagination } from '@/hooks/schools/useSchoolPagination';
import { useSchoolAdmins } from '@/hooks/schools/useSchoolAdmins';
import { useLanguageSafe } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Alt komponentlər
import SchoolHeaderContainer from './SchoolHeaderContainer';
import SchoolFiltersContainer from './SchoolFiltersContainer';
import SchoolTableContainer from './SchoolTableContainer';
import SchoolDialogsContainer from './SchoolDialogsContainer';

// Yardımçı funksiyalar
import exportSchoolsToExcel from '@/utils/exportSchoolsToExcel';

interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: (school: Omit<School, 'id'>) => Promise<void>;
  onEdit: (school: School) => Promise<void>;
  onDelete: (school: School) => Promise<void>;
  onAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
  regionNames: { [key: string]: string };
  sectorNames: { [key: string]: string };
}

const SchoolsContainerRefactored: React.FC<SchoolsContainerProps> = ({
  schools,
  regions,
  sectors,
  isLoading,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onAssignAdmin,
  regionNames,
  sectorNames
}) => {
  const { t } = useLanguageSafe();
  const permissions = usePermissions();
  const user = useAuthStore(selectUser);
  
  // İcazələr
  const canManageSchools = () => {
    return user?.role === 'superadmin' || 
           user?.role === 'regionadmin' || 
           user?.role === 'sectoradmin';
  };
  
  const canEditSchool = (school: School) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'regionadmin' && user.region_id === school.region_id) return true;
    if (user?.role === 'sectoradmin' && user.sector_id === school.sector_id) return true;
    return false;
  };
  
  const canDeleteSchool = (school: School) => {
    return user?.role === 'superadmin';
  };
  
  const canAssignAdmin = (school: School) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'regionadmin' && user.region_id === school.region_id) return true;
    return false;
  };
  
  // Form əməliyyatları üçün submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog idarəetmə hook-u
  const dialogs = useSchoolDialogs();
  
  // Filter hook-u
  const filters = useSchoolFilters(Array.isArray(schools) ? schools : []);
  
  // Pagination məntiqini işlədək
  const pagination = useSchoolPagination(filters.filteredSchools);
  
  // Məktəb ID-lərini əldə edirik
  const schoolIds = useMemo(() => 
    Array.isArray(schools) ? schools.map(school => school.id) : [], 
    [schools]
  );
  
  // Məktəb adminlərini əldə edirik
  const { adminMap, isLoading: isAdminsLoading } = useSchoolAdmins(schoolIds);
  
  // Əməliyyat funksiyaları
  const handleCreateSchool = async (data: Omit<School, 'id'>) => {
    setIsSubmitting(true);
    try {
      await onCreate(data);
      dialogs.closeAddDialog();
      toast.success(t('schoolCreated'));
    } catch (error) {
      toast.error(t('errorCreatingSchool'));
      console.error('Error creating school:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSchool = async (school: School) => {
    setIsSubmitting(true);
    try {
      await onEdit(school);
      dialogs.closeEditDialog();
      toast.success(t('schoolUpdated'));
    } catch (error) {
      toast.error(t('errorUpdatingSchool'));
      console.error('Error updating school:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSchool = async (school: School) => {
    setIsSubmitting(true);
    try {
      await onDelete(school);
      dialogs.closeDeleteDialog();
      toast.success(t('schoolDeleted'));
    } catch (error) {
      toast.error(t('errorDeletingSchool'));
      console.error('Error deleting school:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAssignAdmin = async (schoolId: string, userId: string) => {
    setIsSubmitting(true);
    try {
      await onAssignAdmin(schoolId, userId);
      dialogs.closeAdminDialog();
      toast.success(t('adminAssigned'));
    } catch (error) {
      toast.error(t('errorAssigningAdmin'));
      console.error('Error assigning admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExportToExcel = () => {
    if (!schools || filters.filteredSchools.length === 0) {
      toast.warning(t('noSchoolsToExport') || 'İxrac etmək üçün məktəb tapılmadı');
      return;
    }
    
    try {
      exportSchoolsToExcel(filters.filteredSchools, {
        fileName: 'infoLine_məktəblər.xlsx',
        sheetName: t('schools') || 'Məktəblər'
      });
      toast.success(t('exportSuccess') || 'Məktəblər Excel formatında uğurla ixrac edildi');
    } catch (error) {
      toast.error(t('exportError') || 'Excel ixracı zamanı xəta baş verdi');
      console.error('Error exporting to Excel:', error);
    }
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Component */}
      <SchoolHeaderContainer
        onAdd={dialogs.openAddDialog}
        onExport={handleExportToExcel}
        onRefresh={onRefresh}
        isLoading={isLoading}
        canManageSchools={canManageSchools()}
        schoolsCount={filters.filteredSchools.length}
      />
      
      {/* Filters Component */}
      <SchoolFiltersContainer
        searchTerm={filters.searchTerm}
        regionFilter={filters.regionFilter}
        sectorFilter={filters.sectorFilter}
        statusFilter={filters.statusFilter}
        regions={regions}
        sectors={sectors}
        setSearchTerm={filters.setSearchTerm}
        setRegionFilter={filters.setRegionFilter}
        setSectorFilter={filters.setSectorFilter}
        setStatusFilter={filters.setStatusFilter}
        resetFilters={filters.resetFilters}
      />
      
      {/* Table Component */}
      <SchoolTableContainer
        schools={schools}
        filteredSchools={filters.filteredSchools}
        paginatedSchools={pagination.paginatedSchools}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        regionNames={regionNames}
        sectorNames={sectorNames}
        adminMap={adminMap}
        isAdminsLoading={isAdminsLoading}
        onPageChange={pagination.goToPage}
        onEdit={dialogs.handleEditDialogOpen}
        onDelete={dialogs.handleDeleteDialogOpen}
        onAdmin={dialogs.handleAdminDialogOpen}
        onLinks={dialogs.handleLinkDialogOpen}
        onFiles={dialogs.handleFilesDialogOpen}
        canEditSchool={canEditSchool}
        canDeleteSchool={canDeleteSchool}
        canAssignAdmin={canAssignAdmin}
      />
      
      {/* Dialogs Component */}
      <SchoolDialogsContainer
        isAddDialogOpen={dialogs.isAddDialogOpen}
        isEditDialogOpen={dialogs.isEditDialogOpen}
        isDeleteDialogOpen={dialogs.isDeleteDialogOpen}
        isAdminDialogOpen={dialogs.isAdminDialogOpen}
        isLinkDialogOpen={dialogs.isLinkDialogOpen}
        isFileDialogOpen={dialogs.isFileDialogOpen}
        selectedSchool={dialogs.selectedSchool}
        closeAddDialog={dialogs.closeAddDialog}
        closeEditDialog={dialogs.closeEditDialog}
        closeDeleteDialog={dialogs.closeDeleteDialog}
        closeAdminDialog={dialogs.closeAdminDialog}
        closeLinkDialog={dialogs.closeLinkDialog}
        closeFilesDialog={dialogs.closeFilesDialog}
        onCreateSchool={handleCreateSchool}
        onEditSchool={handleEditSchool}
        onDeleteSchool={handleDeleteSchool}
        onAssignAdmin={handleAssignAdmin}
        regions={regions}
        sectors={sectors}
        isSubmitting={isSubmitting}
        user={user}
      />
    </div>
  );
};

export default SchoolsContainerRefactored;
