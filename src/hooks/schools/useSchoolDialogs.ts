
import { useState, useCallback } from 'react';
import { School } from '@/types/school';
import { School as SupabaseSchool } from '@/types/supabase';

interface UseSchoolDialogsReturn {
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isAddDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  selectedSchool: School | null;
  selectedAdmin: School | null;
  openDeleteDialog: (school: School) => void;
  closeDeleteDialog: () => void;
  openEditDialog: (school: School) => void;
  closeEditDialog: () => void;
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openAdminDialog: (school: School) => void;
  closeAdminDialog: () => void;
  handleEditDialogOpen: (school: SupabaseSchool) => void;
  handleAdminDialogOpen: (school: SupabaseSchool) => void;
  handleDeleteDialogOpen: (school: SupabaseSchool) => void;
}

export const useSchoolDialogs = (): UseSchoolDialogsReturn => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<School | null>(null);

  const openDeleteDialog = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      setSelectedSchool(null);
    }, 300); // Dialog animasiyasını tamamlamaq üçün kiçik gecikmə
  }, []);

  const openEditDialog = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setTimeout(() => {
      setSelectedSchool(null);
    }, 300);
  }, []);

  const openAddDialog = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
  }, []);

  const openAdminDialog = useCallback((school: School) => {
    setSelectedAdmin(school);
    setIsAdminDialogOpen(true);
  }, []);

  const closeAdminDialog = useCallback(() => {
    setIsAdminDialogOpen(false);
    setTimeout(() => {
      setSelectedAdmin(null);
    }, 300);
  }, []);

  const handleEditDialogOpen = useCallback((school: SupabaseSchool) => {
    openEditDialog(school as School);
  }, [openEditDialog]);

  const handleAdminDialogOpen = useCallback((school: SupabaseSchool) => {
    openAdminDialog(school as School);
  }, [openAdminDialog]);

  const handleDeleteDialogOpen = useCallback((school: SupabaseSchool) => {
    openDeleteDialog(school as School);
  }, [openDeleteDialog]);

  return {
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
    closeAdminDialog,
    handleEditDialogOpen,
    handleAdminDialogOpen,
    handleDeleteDialogOpen
  };
};
