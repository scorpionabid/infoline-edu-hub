
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface BulkDataEntryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedSchools?: string[];
  categoryId?: string;
  onComplete?: () => void;
}

export const BulkDataEntryDialog: React.FC<BulkDataEntryDialogProps> = ({
  open,
  onClose,
  selectedSchools = [],
  categoryId,
  onComplete
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Toplu Məlumat Girişi</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Bu funksiya hazırlanır...</p>
          <p>Seçilmiş məktəblər: {selectedSchools.length}</p>
          <p>Kateqoriya: {categoryId}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDataEntryDialog;
