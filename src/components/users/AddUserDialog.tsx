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
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [step, setStep] = useState<'create' | 'assign'>('create');
  
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
    setCreatedUserId(null);
    setStep('create');
  };

  // ADDIM 1: İstifadəçi yarat (Supabase Auth)
  const handleCreateUser = async () => {
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
      
      // Supabase Auth ilə istifadəçi yarat
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          },
          emailRedirectTo: window.location.origin + '/users',
          shouldCreateSession: false // Avtomatik sessiya yaratma
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
      
      // İstifadəçi uğurla yaradıldı
      setCreatedUserId(authData.user.id);
      
      // İstifadəçi yaradıldıqdan sonra rol təyin etmə addımına keç
      setStep('assign');
      toast.success(t('userCreatedSuccessfully'));
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
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
        toast.error(error.message || t('errorCreatingUser'));
      }
    } finally {
      setLoading(false);
    }
  };

  // ADDIM 2: İstifadəçini təyin et (manual)
  const handleAssignUserRole = async () => {
    if (!createdUserId) {
      console.error('No user ID available for role assignment');
      return;
    }

    setLoading(true);
    try {
      console.log('Assigning role to user manually:', {
        userId: createdUserId,
        role: formData.role
      });
      
      // İstifadəçi rolunu user_roles cədvəlinə əlavə et
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: createdUserId,
          role: formData.role,
          region_id: formData.regionId || null,
          sector_id: formData.sectorId || null,
          school_id: formData.schoolId || null
        });
      
      if (roleError) {
        console.error('Error assigning role to user:', roleError);
        throw roleError;
      }
      
      console.log('User role assigned successfully');
      
      // İstifadəçi uğurla təyin edildi
      toast.success(t('userRoleAssignedSuccessfully'));
      resetForm();
      onComplete();
      
    } catch (error: any) {
      console.error('Error assigning role to user:', error);
      toast.error(error.message || t('errorAssigningUserRole'));
      
      // Xəta olsa da istifadəçi yaradılıb, ona görə bildiriş göstəririk
      toast.info(t('userCreatedButRoleNotAssigned'), {
        duration: 5000,
        description: t('userCreatedButRoleNotAssignedDescription')
      });
      
      // Xəta olsa da prosesi tamamlayırıq
      resetForm();
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  // İstifadəçi əlavə et (ümumi handler)
  const handleAddUser = async () => {
    if (step === 'create') {
      await handleCreateUser();
    } else {
      await handleAssignUserRole();
    }
  };

  // Dialoqu bağla və formu sıfırla
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Addımı keç
  const handleSkipAssignment = () => {
    toast.info(t('userCreatedRoleNotAssigned'), {
      duration: 5000,
      description: t('userCreatedRoleNotAssignedDescription')
    });
    resetForm();
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'create' ? t('addNewUser') : t('assignUserRole')}
          </DialogTitle>
          <DialogDescription>
            {step === 'create' ? t('addUserDescription') : t('assignUserRoleDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <UserForm 
          formData={formData} 
          onChange={handleFormChange}
          disableFields={step === 'assign' ? ['fullName', 'email', 'password', 'phone', 'position', 'language'] : []}
          requiredFields={step === 'create' ? ['fullName', 'email', 'password'] : ['role']}
        />
        
        <DialogFooter className="flex justify-between">
          {step === 'assign' ? (
            <>
              <Button variant="outline" onClick={handleSkipAssignment}>
                {t('skipAssignment')}
              </Button>
              <Button onClick={handleAddUser} disabled={loading}>
                {loading ? t('loading') : t('assignRole')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                {t('cancel')}
              </Button>
              <Button onClick={handleAddUser} disabled={loading}>
                {loading ? t('loading') : t('createUser')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
