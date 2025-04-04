
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Məktəbi sil</DialogTitle>
          <DialogDescription>
            Bu məktəbi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Button variant="destructive" onClick={onConfirm}>
            Sil
          </Button>
          <Button variant="outline" onClick={onClose}>
            Ləğv et
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
