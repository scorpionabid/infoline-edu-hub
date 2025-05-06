
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
import { supabase } from '@/integrations/supabase/client';

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

  const handleDelete = async () => {
    if (!user) return; // Əgər user undefined olsa, əməliyyatı dayandır
    
    setLoading(true);
    
    try {
      // 1. İlk olaraq user_roles cədvəlindən silirik
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
      
      if (roleError) {
        console.error('Error deleting from user_roles:', roleError);
        // Xəta olsa da davam edirik, çünki istifadəçi cədvəldə olmaya bilər
      }
      
      // 2. Sonra profiles cədvəlindən silirik
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) {
        console.error('Error deleting from profiles:', profileError);
        // Xəta olsa da davam edirik, çünki istifadəçi cədvəldə olmaya bilər
      }
      
      // 3. Edge Function vasitəsilə Supabase Auth-dan istifadəçini silirik
      const { error: authError } = await supabase.functions.invoke('delete-user', {
        body: { user_id: user.id }
      });
      
      if (authError) {
        console.error('Error deleting from auth:', authError);
        // Xəta olsa da davam edirik, çünki əsas cədvəllərdən artıq silmişik
      }
      
      // İstifadəçi uğurla silindi
      onDelete(user.id);
      onOpenChange(false);
      
      toast.success(t('userDeleted'), {
        description: t('userDeletedDesc')
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      toast.error(t('deleteError'), {
        description: error.message || t('deleteErrorDesc')
      });
    } finally {
      setLoading(false);
    }
  };

  // Əgər user undefined olsa, dialoqu göstərmə
  if (!user) {
    return null;
  }

  // İstifadəçi adını əldə et, müxtəlif xüsusiyyətlərdən
  const getUserName = () => {
    return user.name || user.fullName || user.full_name || t('unknownUser');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteUser')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteUserConfirmation')} <strong>{getUserName()}</strong>?
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
