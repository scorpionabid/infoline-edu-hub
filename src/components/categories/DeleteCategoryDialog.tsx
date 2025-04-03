
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';

export interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<boolean>;
  categoryId: string;
  categoryName: string;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  onDelete,
  categoryId,
  categoryName
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash className="h-5 w-5 text-destructive" />
            Kateqoriyanı silmək istədiyinizə əminsiniz?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              <strong>{categoryName}</strong> kateqoriyasını silmək istədiyinizi təsdiqləyin.
              Bu əməliyyat geri qaytarıla bilməz və bütün əlaqəli məlumatlar silinəcək.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ləğv et</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Silinir...' : 'Bəli, sil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;
