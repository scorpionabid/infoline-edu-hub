
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
import { useLanguage } from '@/context/LanguageContext';

interface CategoryConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CategoryConfirmationDialog: React.FC<CategoryConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('unsavedChanges')}</DialogTitle>
          <DialogDescription>
            {t('unsavedChangesDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('discardChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryConfirmationDialog;
