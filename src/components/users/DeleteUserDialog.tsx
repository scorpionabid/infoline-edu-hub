
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
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: FullUserData; // user prop-u optional edildi
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
    if (!user) {
      console.error('No user provided to delete');
      onOpenChange(false);
      return;
    }
    
    setLoading(true);
    
    try {
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
  };

  // User verisi olmadığı halda dialog göstərilməməlidir
  if (!user) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteUser')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteUserConfirmation')} <strong>{user.full_name || user.name || t('unknownUser')}</strong>?
            <div className="mt-2 text-destructive font-semibold">{t('deleteUserWarning')}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
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

export default DeleteUserDialog;
