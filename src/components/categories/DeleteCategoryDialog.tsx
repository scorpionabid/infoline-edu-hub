
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
import { Category } from '@/types/category';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
  category: Category | null;
  isSubmitting: boolean;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  isSubmitting
}) => {
  const handleConfirm = async () => {
    if (!category) return;
    await onConfirm(category.id);
    onClose();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kateqoriyanı silmək istədiyinizə əminsiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium">{category?.name}</span> kateqoriyasını silmək istədiyinizə əminsiniz?
            <br />
            <br />
            Bu əməliyyat geri qaytarıla bilməz. Bu kateqoriyaya aid bütün məlumatlar silinəcək.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Ləğv et</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? 'Silinir...' : 'Bəli, sil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;
