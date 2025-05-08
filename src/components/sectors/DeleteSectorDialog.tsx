
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sector } from '@/types/supabase';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';

interface DeleteSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteSector')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteSectorConfirmation')}
            {sector && (
              <span className="font-semibold block mt-2">{sector.name}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('deleting')}
              </>
            ) : (
              t('delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSectorDialog;
