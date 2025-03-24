
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  categoryName?: string;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  categoryName
}) => {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = () => {
    setIsDeleting(true);
    // API çağrışı simyulasiyası
    setTimeout(() => {
      onConfirm();
      setIsDeleting(false);
    }, 500);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {categoryName 
              ? t('deleteCategoryConfirmationName').replace('{name}', categoryName) 
              : t('deleteCategoryConfirmation')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteCategoryWarning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <Button 
            onClick={handleConfirm}
            variant="destructive"
            className="gap-2"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;
