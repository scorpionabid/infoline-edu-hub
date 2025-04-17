import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserFormData } from '@/types/user';
import { useAuth } from '@/context/auth';
import UserForm from './UserForm';
import { useCreateUser } from '@/hooks/useCreateUser';
import { Loader2 } from 'lucide-react';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: 'region' | 'sector' | 'school';
  onSuccess?: () => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  open, 
  onOpenChange, 
  entityType,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { createUser, loading } = useCreateUser();
  
  const getInitialRole = () => {
    if (entityType === 'region') return 'regionadmin';
    if (entityType === 'sector') return 'sectoradmin';
    if (entityType === 'school') return 'schooladmin';
    return 'schooladmin';
  };
  
  const initialFormData: UserFormData = {
    full_name: '',
    email: '',
    password: '',
    role: getInitialRole(),
    status: 'active',
    region_id: currentUser?.role === 'regionadmin' ? currentUser.regionId : undefined,
    sector_id: undefined,
    school_id: undefined,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  };
  
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  
  React.useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open, entityType]);
  
  const handleSubmit = async () => {
    console.log('İstifadəçi yaratma formunun məlumatları:', formData);
    
    const result = await createUser(formData);
    
    if (result.success) {
      setFormData(initialFormData);
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    }
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
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.full_name || !formData.email || !formData.password}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('creating')}
              </>
            ) : (
              t('createUser')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
