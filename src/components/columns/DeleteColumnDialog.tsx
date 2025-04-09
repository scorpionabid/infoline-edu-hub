
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
import { useLanguage } from '@/context/LanguageContext';

interface DeleteColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>; // Parametrsiz funksiya - çünki artıq içəridən id'ni ötürürük
  column: string;
  columnName: string;
  isSubmitting?: boolean;
}

const DeleteColumnDialog: React.FC<DeleteColumnDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  column,
  columnName,
  isSubmitting = false
}) => {
  const { t } = useLanguage();

  const handleConfirm = async () => {
    if (!column) return;
    await onConfirm();
    // onClose'u onConfirm içində çağırılır, bu səbəbdən burada təkrar çağırmağa ehtiyac yoxdur
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteConfirmationTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium">{columnName}</span> sütununu silmək istədiyinizə əminsiniz?
            <br />
            <br />
            Bu əməliyyat geri qaytarıla bilməz. Bu sütuna aid bütün məlumatlar silinəcək.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? 'Silinir...' : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteColumnDialog;
