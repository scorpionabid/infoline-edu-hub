
import { useState } from 'react';
import { Sector } from '@/types/sector';

interface SectorDialogHooks {
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  selectedSector: Sector | null;
  openCreateDialog: () => void;
  openEditDialog: (sector: Sector) => void;
  openDeleteDialog: (sector: Sector) => void;
  closeDialogs: () => void;
}

export const useSectorDialogs = (): SectorDialogHooks => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  
  const openCreateDialog = () => {
    setShowCreateDialog(true);
  };
  
  const openEditDialog = (sector: Sector) => {
    setSelectedSector(sector);
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (sector: Sector) => {
    setSelectedSector(sector);
    setShowDeleteDialog(true);
  };
  
  const closeDialogs = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setSelectedSector(null);
  };
  
  return {
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    selectedSector,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
  };
};
