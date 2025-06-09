
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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { School } from '@/types/school';

interface DeleteSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const DeleteSchoolDialog: React.FC<DeleteSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  onConfirm,
  isSubmitting = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Məktəbi sil
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>"{school.name}"</strong> məktəbini silmək istədiyinizə əminsiniz?
            <div className="mt-2 text-sm">
              Bu əməliyyat geri qaytarıla bilməz və bütün məktəblə əlaqəli məlumatlar silinəcək.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isSubmitting}>
            Ləğv et
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Silinir...
              </>
            ) : (
              'Sil'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
