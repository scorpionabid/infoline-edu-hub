
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
} from "@/components/ui/alert-dialog";
import { useLanguage } from '@/context/LanguageContext';

interface DeleteColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<any>; // Yalnız id qəbul edir
  columnId: string;
  columnName: string;
}

const DeleteColumnDialog: React.FC<DeleteColumnDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  columnId,
  columnName,
}) => {
  const { t } = useLanguage();

  const handleConfirm = async () => {
    try {
      await onConfirm(columnId); // onConfirm funksiyası yalnız columnId qəbul edir
      onClose();
    } catch (error) {
      console.error("Sütunu silmək mümkün olmadı:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteColumnTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteColumnWarning', { name: columnName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive">
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteColumnDialog;
