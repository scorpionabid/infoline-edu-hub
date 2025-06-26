
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface SchoolFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
}

export const SchoolFilesDialog: React.FC<SchoolFilesDialogProps> = ({
  open,
  onOpenChange,
  // schoolId
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Məktəb Faylları</DialogTitle>
          <DialogDescription>
            Məktəb ID: {schoolId} üçün fayllar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Fayl sistemi hələ tamamlanmayıb. Bu bölmə tezliklə əlavə ediləcək.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
