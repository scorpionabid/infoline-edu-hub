
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
import { Loader2 } from 'lucide-react';

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  columnName: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const DeleteColumnDialog: React.FC<DeleteColumnDialogProps> = ({ 
  open, 
  onOpenChange, 
  columnId, 
  columnName,
  onConfirm,
  isSubmitting = false
}) => {
  const { t } = useLanguage();

  const handleClose = () => onOpenChange(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteColumn")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteColumnConfirmation")}
            <span className="font-semibold block mt-2">{columnName}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive hover:bg-destructive/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('deleting')}
              </>
            ) : (
              t("delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteColumnDialog;
