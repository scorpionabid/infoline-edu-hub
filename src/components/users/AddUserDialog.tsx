
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserFormData } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import UserForm from './UserForm';
import { toast } from 'sonner';
import { UserRole } from '@/types/supabase';

// Mock data import
import { mockUsers } from '@/data/mockUsers';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: 'region' | 'sector' | 'school';
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  open, 
  onOpenChange, 
  entityType 
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  
  // Set appropriate initial role based on entity type
  const getInitialRole = (): UserRole => {
    if (entityType === 'region') return 'regionadmin';
    if (entityType === 'sector') return 'sectoradmin';
    if (entityType === 'school') return 'schooladmin';
    return 'schooladmin';
  };
  
  const initialFormData: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: getInitialRole(),
    status: 'active',
    regionId: currentUser?.role === 'regionadmin' ? currentUser.regionId : undefined,
    notificationSettings: {
      email: true,
      inApp: true, // inApp əlavə edildi
      system: true
    }
  };
  
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  
  React.useEffect(() => {
    // Reset form data when dialog opens
    if (open) {
      setFormData(initialFormData);
    }
  }, [open, entityType]);
  
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add the new user to the mock data
      const newUser = {
        ...formData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Instead of pushing directly to mockUsers, we should use a proper API call
      console.log('Would create user:', newUser);
      
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
  
  const getDialogTitle = () => {
    if (entityType === 'region') return t('addNewRegionWithAdmin');
    if (entityType === 'sector') return t('addNewSectorWithAdmin');
    if (entityType === 'school') return t('addNewSchoolWithAdmin');
    return t('addNewUser');
  };
  
  const getDialogDescription = () => {
    if (entityType === 'region') return t('addNewRegionWithAdminDesc');
    if (entityType === 'sector') return t('addNewSectorWithAdminDesc');
    if (entityType === 'school') return t('addNewSchoolWithAdminDesc');
    return t('addNewUserDesc');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        <UserForm 
          data={formData} 
          onChange={setFormData} 
          currentUserRole={currentUser?.role}
          currentUserRegionId={currentUser?.regionId}
          passwordRequired
          entityType={entityType}
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
