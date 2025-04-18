import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/user';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import UserForm from './UserForm';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { supabase } from '@/integrations/supabase/client';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: FullUserData | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  user 
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<any>({});
  
  // İstifadəçi məlumatlarını form məlumatlarına çevir
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        regionId: user.regionId || '',
        sectorId: user.sectorId || '',
        schoolId: user.schoolId || '',
        status: user.status || 'active',
        phone: user.phone || '',
        position: user.position || '',
        language: user.language || 'az',
      });
    }
  }, [user]);

  // Form məlumatlarının dəyişməsi
  const handleFormChange = (newData: any) => {
    setFormData(newData);
  };

  // İstifadəçini yenilə
  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // İstifadəçi məlumatlarını yenilə
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role,
          region_id: formData.regionId,
          sector_id: formData.sectorId,
          school_id: formData.schoolId,
          status: formData.status,
          phone: formData.phone,
          position: formData.position,
          language: formData.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(t('userUpdatedSuccessfully'));
      onComplete();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(t('errorUpdatingUser'));
    } finally {
      setLoading(false);
    }
  };

  // Şifrəni sıfırla
  const handleResetPassword = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Şifrə sıfırlama e-poçtu göndər
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success(t('passwordResetEmailSent'));
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(t('errorResettingPassword'));
    } finally {
      setLoading(false);
    }
  };

  // İstifadəçini deaktiv et
  const handleDeactivate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // İstifadəçini deaktiv et
      const { error } = await supabase
        .from('users')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(t('userDeactivatedSuccessfully'));
      onComplete();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast.error(t('errorDeactivatingUser'));
    } finally {
      setLoading(false);
    }
  };

  // İstifadəçini aktivləşdir
  const handleActivate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // İstifadəçini aktivləşdir
      const { error } = await supabase
        .from('users')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(t('userActivatedSuccessfully'));
      onComplete();
    } catch (error: any) {
      console.error('Error activating user:', error);
      toast.error(t('errorActivatingUser'));
    } finally {
      setLoading(false);
    }
  };

  // Şifrə sıfırlama icazəsi
  const canResetPassword = (isSuperAdmin || isRegionAdmin) && 
                           currentUser?.id !== user?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('editUser')}</DialogTitle>
          <DialogDescription>
            {t('editUserDescription')}
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <UserForm 
            initialData={formData}
            onChange={handleFormChange}
            isEditMode={true}
          />
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            {canResetPassword && (
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {t('resetPassword')}
              </Button>
            )}
            
            {user?.status === 'active' ? (
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={loading}
              >
                {t('deactivate')}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleActivate}
                disabled={loading}
              >
                {t('activate')}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
