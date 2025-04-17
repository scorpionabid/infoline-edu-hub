
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
import { User } from '@/types/user';
import { toast } from 'sonner';

export interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onDelete: (userId: string) => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = React.useState(false);

  const handleDelete = () => {
    setLoading(true);
    
    // API çağırışını simulyasiya et
    setTimeout(() => {
      try {
        // Gerçək tətbiqdə, burada istifadəçinin silinməsi üçün API çağırışı olacaq
        onDelete(user.id);
        setLoading(false);
        onOpenChange(false);
        
        toast.success(t('userDeleted'), {
          description: t('userDeletedDesc')
        });
      } catch (error) {
        setLoading(false);
        toast.error(t('deleteError'), {
          description: t('deleteErrorDesc')
        });
      }
    }, 1000);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteUser')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteUserConfirmation')} <strong>{user.name || user.full_name}</strong>?
            <div className="mt-2 text-destructive font-semibold">{t('deleteUserWarning')}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
