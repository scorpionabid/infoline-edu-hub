
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BulkDataEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkDataEntryDialog: React.FC<BulkDataEntryDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Toplu Məlumat Girişi</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Bu funksiya hazırlanır...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDataEntryDialog;
