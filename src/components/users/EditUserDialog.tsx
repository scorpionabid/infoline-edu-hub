
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData, UserRole } from '@/types/user';
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
        fullName: user.full_name || '',
        email: user.email || '',
        role: (user.role as UserRole) || 'user',
        regionId: user.region_id || user.regionId || '',
        sectorId: user.sector_id || user.sectorId || '',
        schoolId: user.school_id || user.schoolId || '',
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
    if (!user || !user.id) {
      console.error('User ID is missing');
      toast.error(t('errorUpdatingUser'));
      return;
    }
    
    console.log('Updating user with ID:', user.id);
    
    setLoading(true);
    try {
      // 1. Profil məlumatlarını yenilə
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone || null,
          // Yalnız profiles cədvəlində olan sütunlar
        })
        .eq('id', user.id);
    
      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }
      
      console.log('Profile updated successfully');
    
      // 2. Əvvəlcə user_roles cədvəlində istifadəçinin olub-olmadığını yoxla
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('Existing role check:', existingRole, checkError);

      if (checkError || !existingRole) {
        // İstifadəçi user_roles cədvəlində yoxdursa, yeni yazı əlavə et
        console.log('User role not found, inserting new role');
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: formData.role,
            region_id: formData.regionId || null,
            sector_id: formData.sectorId || null,
            school_id: formData.schoolId || null,
            status: 'active'
          });
          
        if (insertError) {
          console.error('Error inserting user role:', insertError);
          throw insertError;
        }
        
        console.log('User role inserted successfully');
      } else {
        // İstifadəçi varsa, məlumatları yenilə
        console.log('User role found, updating existing role');
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({
            role: formData.role,
            region_id: formData.regionId || null,
            sector_id: formData.sectorId || null,
            school_id: formData.schoolId || null,
          })
          .eq('user_id', user.id);
          
        if (roleError) {
          console.error('Error updating user role:', roleError);
          throw roleError;
        }
        
        console.log('User role updated successfully');
      }
    
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
        .from('profiles')
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
        .from('profiles')
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
            formData={formData}
            onChange={handleFormChange}
            isEditMode={true}
            disableFields={['email']}
            requiredFields={['fullName', 'role']}
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
