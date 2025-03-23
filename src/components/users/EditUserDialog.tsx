
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { User, UserFormData } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import UserForm from './UserForm';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (user: User) => void;
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
  
  // Convert User to UserFormData
  const initialFormData: UserFormData = {
    name: user.name,
    email: user.email,
    role: user.role,
    regionId: user.regionId,
    sectorId: user.sectorId,
    schoolId: user.schoolId,
    status: user.status,
    avatar: user.avatar,
    passwordResetDate: user.passwordResetDate,
    twoFactorEnabled: user.twoFactorEnabled,
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
      const updatedUser: User = {
        ...user,
        ...formData,
        updatedAt: new Date(),
      };
      
      // If password was reset, update the passwordResetDate
      if (showPasswordReset && formData.password) {
        updatedUser.passwordResetDate = new Date();
      }
      
      onSave(updatedUser);
      setLoading(false);
      setShowPasswordReset(false);
      onOpenChange(false);
    }, 1000);
  };

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    if (!showPasswordReset) {
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };
  
  // Check if current user can reset this user's password
  const canResetPassword = () => {
    if (!currentUser || !user) return false;
    
    // Super admin can reset anyone's password
    if (currentUser.role === 'superadmin') return true;
    
    // Region admin can reset sector and school admins' passwords
    if (currentUser.role === 'regionadmin' && 
       (user.role === 'sectoradmin' || user.role === 'schooladmin')) {
      return true;
    }
    
    // Sector admin can reset school admins' passwords
    if (currentUser.role === 'sectoradmin' && user.role === 'schooladmin') {
      return true;
    }
    
    return false;
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
          currentUserRegionId={currentUser?.regionId}
          isEdit={true}
          passwordRequired={false}
          showPasswordReset={showPasswordReset}
        />
        
        <DialogFooter>
          <div className="mr-auto">
            {canResetPassword() && (
              <Button 
                variant="outline" 
                type="button" 
                onClick={togglePasswordReset}
              >
                {showPasswordReset ? t('cancelPasswordReset') : t('resetPassword')}
              </Button>
            )}
          </div>
          
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
