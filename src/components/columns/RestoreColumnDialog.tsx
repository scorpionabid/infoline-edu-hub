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
import { RotateCcw, Loader2 } from 'lucide-react';

interface RestoreColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  columnName: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const RestoreColumnDialog: React.FC<RestoreColumnDialogProps> = ({
  open,
  onOpenChange,
  columnId,
  columnName,
  onConfirm,
  isSubmitting = false
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-600" />
            Sütunu bərpa et
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            <strong>"{columnName}"</strong> sütununu bərpa etmək istədiyinizə əminsiniz?
            <div className="mt-2 text-sm text-muted-foreground">
              Bu əməliyyat sütunu yenidən aktiv edəcək və istifadəyə hazır hala gətirəcək.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Ləğv et
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bərpa edilir...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Bərpa et
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreColumnDialog;