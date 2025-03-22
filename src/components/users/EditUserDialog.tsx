
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
    notificationSettings: user.notificationSettings
  };
  
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  
  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      setFormData(initialFormData);
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
      
      onSave(updatedUser);
      setLoading(false);
      onOpenChange(false);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          isEdit
        />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.name || !formData.email}
          >
            {loading ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
