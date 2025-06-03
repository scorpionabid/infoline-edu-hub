
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { School } from '@/types/school';

interface DeleteSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  school: School;
  isSubmitting: boolean;
}

export const DeleteSchoolDialog: React.FC<DeleteSchoolDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  school,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Məktəbi sil</DialogTitle>
          <DialogDescription>
            "{school.name}" məktəbini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Ləğv et
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Silinir...' : 'Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSchoolDialog;
