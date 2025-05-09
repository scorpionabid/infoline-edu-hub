
import React from 'react';
import { Region } from '@/types/supabase';
import AddRegionDialog from './AddRegionDialog';
import EditRegionDialog from './EditRegionDialog';
import DeleteRegionDialog from './DeleteRegionDialog';
import AssignAdminDialog from './AssignAdminDialog';
import { useAssignUserAsAdmin } from '@/hooks/admin/useAssignUserAsAdmin';

interface RegionDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsAdminDialogOpen: (open: boolean) => void;
  selectedRegion: Region | null;
  onAddRegion: (region: Partial<Region>) => Promise<void>;
  onEditRegion: (region: Region) => Promise<void>;
  onDeleteRegion: (regionId: string) => Promise<void>;
  isSubmitting: boolean;
}

const RegionDialogs: React.FC<RegionDialogsProps> = ({
  isAddDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isAdminDialogOpen,
  setIsAddDialogOpen,
  setIsEditDialogOpen,
  setIsDeleteDialogOpen,
  setIsAdminDialogOpen,
  selectedRegion,
  onAddRegion,
  onEditRegion,
  onDeleteRegion,
  isSubmitting
}) => {
  const { assignRegionAdmin, isLoading: isAssigningAdmin } = useAssignUserAsAdmin();

  const handleAssignAdmin = async (userId: string) => {
    if (!selectedRegion) return;
    const success = await assignRegionAdmin(selectedRegion.id, userId);
    if (success) {
      setIsAdminDialogOpen(false);
    }
  };

  return (
    <>
      {isAddDialogOpen && (
        <AddRegionDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={onAddRegion}
          isSubmitting={isSubmitting}
        />
      )}

      {isEditDialogOpen && selectedRegion && (
        <EditRegionDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          region={selectedRegion}
          onSubmit={onEditRegion}
          isSubmitting={isSubmitting}
        />
      )}

      {isDeleteDialogOpen && selectedRegion && (
        <DeleteRegionDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          region={selectedRegion}
          onConfirm={() => onDeleteRegion(selectedRegion.id)}
          isSubmitting={isSubmitting}
        />
      )}

      {isAdminDialogOpen && selectedRegion && (
        <AssignAdminDialog
          isOpen={isAdminDialogOpen}
          onClose={() => setIsAdminDialogOpen(false)}
          region={selectedRegion}
          onSubmit={handleAssignAdmin}
          isSubmitting={isAssigningAdmin}
        />
      )}
    </>
  );
};

export default RegionDialogs;
