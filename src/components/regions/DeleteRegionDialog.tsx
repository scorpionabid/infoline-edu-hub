
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

export interface DeleteRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

const DeleteRegionDialog: React.FC<DeleteRegionDialogProps> = ({
  isOpen,
  onClose,
  region,
  onConfirm,
  isSubmitting
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteRegion')}</DialogTitle>
          <DialogDescription>
            {t('deleteRegionConfirmation', { name: region.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-destructive">
            {t('deleteRegionWarning')}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onConfirm} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                t('delete')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRegionDialog;
