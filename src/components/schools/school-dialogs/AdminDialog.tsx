
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';
import { supabase } from '@/lib/supabase';

export interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  onResetPassword: (newPassword: string) => void;
  school: School | null;
  onUpdate?: () => void;
}

export const AdminDialog: React.FC<AdminDialogProps> = ({
  open,
  onClose,
  onResetPassword,
  school,
  onUpdate
}) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const adminEmail = school?.admin_email || school?.adminEmail;

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error(t('passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await onResetPassword(newPassword);
      setNewPassword('');
      toast.success(t('passwordResetSuccess'));
    } catch (error) {
      console.error('Şifrə sıfırlama xətası:', error);
      toast.error(t('passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!school || !onUpdate) return;
    
    try {
      setLoading(true);
      await onUpdate();
      toast.success(t('adminInfoUpdated'));
    } catch (error) {
      console.error('Admin məlumatlarını yeniləmə xətası:', error);
      toast.error(t('adminUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('schoolAdminManagement')}</DialogTitle>
          <DialogDescription>
            {adminEmail
              ? t('manageSchoolAdmin', { email: adminEmail })
              : t('noAdminAssigned')}
          </DialogDescription>
        </DialogHeader>

        {adminEmail && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('enterNewPassword')}
              />
              <p className="text-xs text-muted-foreground">{t('passwordResetDescription')}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          
          {adminEmail && (
            <Button onClick={handleResetPassword} disabled={!newPassword || loading}>
              {loading ? t('resetting') : t('resetPassword')}
            </Button>
          )}
          
          {adminEmail && onUpdate && (
            <Button onClick={handleUpdateInfo} disabled={loading}>
              {loading ? t('updating') : t('updateInfo')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;
