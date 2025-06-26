
import { useState, useCallback } from 'react';
import { School } from '@/types/supabase';

interface UseSchoolDialogsReturn {
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isAddDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  isLinkDialogOpen: boolean;
  isFileDialogOpen: boolean;
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
  openLinkDialog: (school: School) => void;
  closeLinkDialog: () => void;
  openFilesDialog: (school: School) => void;
  closeFilesDialog: () => void;
  handleEditDialogOpen: (school: School) => void;
  handleAdminDialogOpen: (school: School) => void;
  handleDeleteDialogOpen: (school: School) => void;
  handleLinkDialogOpen: (school: School) => void;
  handleFilesDialogOpen: (school: School) => void;
}

export const useSchoolDialogs = (): UseSchoolDialogsReturn => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
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

  const handleEditDialogOpen = useCallback((school: School) => {
    openEditDialog(school);
  }, [openEditDialog]);

  const handleAdminDialogOpen = useCallback((school: School) => {
    openAdminDialog(school);
  }, [openAdminDialog]);

  const handleDeleteDialogOpen = useCallback((school: School) => {
    openDeleteDialog(school);
  }, [openDeleteDialog]);

  const openLinkDialog = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsLinkDialogOpen(true);
  }, []);

  const closeLinkDialog = useCallback(() => {
    setIsLinkDialogOpen(false);
    setTimeout(() => {
      setSelectedSchool(null);
    }, 300);
  }, []);

  const openFilesDialog = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsFileDialogOpen(true);
  }, []);

  const closeFilesDialog = useCallback(() => {
    setIsFileDialogOpen(false);
    setTimeout(() => {
      setSelectedSchool(null);
    }, 300);
  }, []);

  const handleLinkDialogOpen = useCallback((school: School) => {
    openLinkDialog(school);
  }, [openLinkDialog]);

  const handleFilesDialogOpen = useCallback((school: School) => {
    openFilesDialog(school);
  }, [openFilesDialog]);

  return {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    isLinkDialogOpen,
    isFileDialogOpen,
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
    openLinkDialog,
    closeLinkDialog,
    openFilesDialog,
    closeFilesDialog,
    handleEditDialogOpen,
    handleAdminDialogOpen,
    handleDeleteDialogOpen,
    handleLinkDialogOpen,
    // handleFilesDialogOpen
  };
};
