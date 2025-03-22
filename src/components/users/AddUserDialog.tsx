
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserFormData } from '@/types/user';
import { useAuth, Role } from '@/context/AuthContext';
import UserForm from './UserForm';
import { toast } from 'sonner';

// Mock data import
import { mockUsers } from '@/data/mockUsers';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  
  const initialFormData: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: 'schooladmin',
    status: 'active',
    regionId: currentUser?.role === 'regionadmin' ? currentUser.regionId : undefined,
    notificationSettings: {
      email: true,
      system: true
    }
  };
  
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add the new user to the mock data
      const newUser = {
        ...formData,
        id: `user-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockUsers.push(newUser);
      
      // Show success message
      toast.success(t('userCreated'), {
        description: t('userCreatedDesc')
      });
      
      // Reset form and close dialog
      setFormData(initialFormData);
      setLoading(false);
      onOpenChange(false);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addNewUser')}</DialogTitle>
          <DialogDescription>{t('addNewUserDesc')}</DialogDescription>
        </DialogHeader>
        
        <UserForm 
          data={formData} 
          onChange={setFormData} 
          currentUserRole={currentUser?.role}
          currentUserRegionId={currentUser?.regionId}
          passwordRequired
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
            disabled={loading || !formData.name || !formData.email || !formData.password}
          >
            {loading ? t('creating') : t('createUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
