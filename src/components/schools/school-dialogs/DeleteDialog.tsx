
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { School } from '@/types/school';
import { useLanguage } from '@/context/LanguageContext';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onDelete: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onOpenChange, school, onDelete }) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('deleteSchool')}</DialogTitle>
          <DialogDescription>
            {t('deleteSchoolConfirmation')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Button variant="destructive" onClick={onDelete}>
            {t('delete')}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
