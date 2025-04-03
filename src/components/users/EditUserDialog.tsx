
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { User, UserFormData } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import UserForm from './UserForm';
import { UpdateUserData, FullUserData } from '@/types/supabase';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (user: UpdateUserData) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ 
  open, 
  onOpenChange, 
  user, 
  onSave 
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [showPasswordReset, setShowPasswordReset] = React.useState(false);
  const canResetPassword = (currentUser?.role === 'superadmin' || currentUser?.role === 'regionadmin') && 
                           currentUser?.role !== user.role &&
                           user.id !== currentUser?.id;
  
  // Convert User to UserFormData
  const initialFormData: UserFormData = {
    name: user.full_name || user.name || '',
    email: user.email,
    role: user.role,
    regionId: user.region_id || user.regionId,
    sectorId: user.sector_id || user.sectorId,
    schoolId: user.school_id || user.schoolId,
    status: user.status,
    avatar: user.avatar,
    language: user.language,
    notificationSettings: user.notificationSettings,
    password: ''  // Add empty password field for reset
  };
  
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  
  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      setFormData(initialFormData);
      setShowPasswordReset(false);
    }
  }, [user]);
  
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUserData: UpdateUserData = {
        full_name: formData.name,
        email: formData.email,
        role: formData.role,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        school_id: formData.schoolId,
        status: formData.status as 'active' | 'inactive' | 'blocked',
        language: formData.language,
        phone: formData.phone,
        position: formData.position,
        avatar: formData.avatar,
      };
      
      if (showPasswordReset && formData.password) {
        updatedUserData.password = formData.password;
      }
      
      onSave(updatedUserData);
      
      if (showPasswordReset) {
        toast.success(t('passwordResetSuccess'), {
          description: t('passwordResetRequired')
        });
      } else {
        toast.success(t('userUpdated'), {
          description: t('userUpdatedDesc')
        });
      }
      
      setLoading(false);
      setShowPasswordReset(false);
      onOpenChange(false);
    }, 1000);
  };

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    if (!showPasswordReset) {
      // Parol sıfırlanma aktivləşdirildikdə, təsadüfi parol təyin etmək və ya boş saxlamaq
      setFormData(prev => ({ ...prev, password: 'password123' }));
    } else {
      // Parol sıfırlanma deaktivləşdirildikdə, parolu təmizləmək
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setShowPasswordReset(false);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('editUser')}</DialogTitle>
          <DialogDescription>{t('editUserDesc')}</DialogDescription>
        </DialogHeader>
        
        <UserForm 
          data={formData} 
          onChange={setFormData} 
          currentUserRole={currentUser?.role}
          currentUserRegionId={currentUser?.regionId || currentUser?.region_id}
          isEdit={true}
          passwordRequired={showPasswordReset}
        />
        
        <DialogFooter>
          {canResetPassword && (
            <div className="mr-auto">
              <Button 
                variant="outline" 
                type="button" 
                onClick={togglePasswordReset}
              >
                {showPasswordReset ? t('cancelPasswordReset') : t('resetPassword')}
              </Button>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.name || !formData.email || (showPasswordReset && (!formData.password || formData.password.length < 6))}
          >
            {loading ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
