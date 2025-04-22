import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import UserForm from './UserForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  filterParams?: {
    regionId?: string;
    sectorId?: string;
    schoolId?: string;
  };
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  filterParams = {}
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  
  // İlkin form məlumatları
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'schooladmin',
    regionId: filterParams.regionId || (isRegionAdmin ? currentUser?.regionId : ''),
    sectorId: filterParams.sectorId || (isSectorAdmin ? currentUser?.sectorId : ''),
    schoolId: filterParams.schoolId || '',
    status: 'active',
    phone: '',
    position: '',
    language: 'az'
  });

  // Form məlumatlarının dəyişməsi
  const handleFormChange = (newData: any) => {
    setFormData(newData);
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'schooladmin',
      regionId: filterParams.regionId || (isRegionAdmin ? currentUser?.regionId : ''),
      sectorId: filterParams.sectorId || (isSectorAdmin ? currentUser?.sectorId : ''),
      schoolId: filterParams.schoolId || '',
      status: 'active',
      phone: '',
      position: '',
      language: 'az'
    });
  };

  // İstifadəçi əlavə et
  const handleAddUser = async () => {
    // Vacib sahələri yoxla
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error(t('pleaseCompleteRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      console.log('Creating new user with data:', {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role
      });
      
      // ADDIM 1: Supabase Auth ilə istifadəçi yarat
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('User created in Auth:', authData);

      if (!authData.user || !authData.user.id) {
        throw new Error('User ID is missing from auth response');
      }
      
      // ADDIM 2: Edge Function vasitəsilə email təsdiqləmə
      try {
        const { data: confirmData, error: confirmError } = await supabase.functions.invoke('confirm-user-email', {
          body: { user_id: authData.user.id }
        });
        
        if (confirmError) {
          console.warn('Could not auto-confirm email via Edge Function:', confirmError);
        } else {
          console.log('User email auto-confirmed successfully via Edge Function');
        }
      } catch (confirmErr) {
        // Email təsdiqini bypass edə bilmədik, amma istifadəçi yaradıldı
        console.warn('Error during email confirmation via Edge Function:', confirmErr);
      }
      
      // ADDIM 3: İstifadəçiyə region təyin etmək (əgər regionId varsa)
      if (formData.regionId) {
        try {
          const { data: roleData, error: roleError } = await supabase.functions.invoke('assign-region-admin', {
            body: { 
              user_id: authData.user.id, 
              region_id: formData.regionId,
              role: formData.role || 'region_admin'
            }
          });
          
          if (roleError) {
            console.warn('Could not assign region to user:', roleError);
          } else {
            console.log('User assigned to region successfully');
          }
        } catch (roleErr) {
          console.warn('Error during region assignment:', roleErr);
        }
      }
      
      // İstifadəçi uğurla yaradıldı, indi istifadəçi siyahısını yeniləyirik
      toast.success(t('userAddedSuccessfully'));
      resetForm();
      onComplete();
      
      // İstifadəçiyə bildiriş göstər
      if (!formData.regionId) {
        toast.info(t('userCreatedAssignRegionLater'), {
          duration: 5000,
          description: t('userCreatedAssignRegionLaterDescription')
        });
      }
      
    } catch (error: any) {
      console.error('Error adding user:', error);
      
      // Auth məhdudiyyəti xətası
      if (error.message && error.message.includes('security purposes')) {
        toast.error(t('authRateLimitError'));
      }
      // Unikal məhdudiyyət xətası
      else if (error.message && error.message.includes('unique constraint')) {
        toast.error(t('emailAlreadyExists'));
      }
      // Email təsdiqləmə xətası
      else if (error.message && error.message.includes('email_not_confirmed')) {
        toast.error(t('emailNotConfirmedError'));
      }
      // Email giriş deaktiv edilib xətası
      else if (error.message && error.message.includes('Email logins are disabled')) {
        toast.error(t('emailLoginsDisabledError'));
      }
      // Digər xətalar
      else {
        toast.error(error.message || t('errorAddingUser'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addNewUser')}</DialogTitle>
          <DialogDescription>
            {t('addUserDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <UserForm 
          initialData={formData}
          onChange={handleFormChange}
          isEditMode={false}
        />
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          
          <Button
            onClick={handleAddUser}
            disabled={loading}
          >
            {loading ? t('adding') : t('addUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
