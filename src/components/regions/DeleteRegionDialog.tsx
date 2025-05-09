
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Region {
  id: string;
  name: string;
}

interface DeleteRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteRegion: (id: string) => void;
  region: Region | null;
  isLoading: boolean;
}

const DeleteRegionDialog: React.FC<DeleteRegionDialogProps> = ({
  isOpen,
  onClose,
  onDeleteRegion,
  region,
  isLoading,
}) => {
  const handleDelete = () => {
    if (region?.id) {
      onDeleteRegion(region.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Region</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the region: {region?.name}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete Region'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRegionDialog;
