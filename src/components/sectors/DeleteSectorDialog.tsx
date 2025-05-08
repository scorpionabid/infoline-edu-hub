
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';

interface DeleteSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  sector: Sector;
  isSubmitting?: boolean;
}

const DeleteSectorDialog: React.FC<DeleteSectorDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sector,
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();

  const handleDelete = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting sector:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('deleteSector')}</DialogTitle>
          <DialogDescription>
            {t('deleteSectorConfirmation', { name: sector.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            {t('cancel')}
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('deleting') : t('delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSectorDialog;
