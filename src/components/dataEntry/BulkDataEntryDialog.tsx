
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BulkDataEntryDialogProps {
  open: boolean;
  onClose: () => void;
}

const BulkDataEntryDialog: React.FC<BulkDataEntryDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Data Entry</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-muted-foreground">Bulk data entry functionality is being developed.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDataEntryDialog;
export { BulkDataEntryDialog };
