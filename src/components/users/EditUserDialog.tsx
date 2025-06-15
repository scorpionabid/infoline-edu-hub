
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserFormData, FullUserData } from '@/types/user';
import UserForm from './UserForm';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => Promise<void>;
  user: FullUserData | null;
  isLoading?: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  isLoading = false
}) => {
  const initialData: UserFormData | undefined = user ? {
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    position: user.position,
    role: user.role,
    region_id: user.region_id,
    sector_id: user.sector_id,
    school_id: user.school_id,
    status: user.status,
    language: user.language,
    notifications: user.notifications,
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İstifadəçini redaktə et</DialogTitle>
          <DialogDescription>
            İstifadəçi məlumatlarını yeniləyin və dəyişiklikləri yadda saxlayın.
          </DialogDescription>
        </DialogHeader>
        
        <UserForm
          onSubmit={onSave}
          initialData={initialData}
          isLoading={isLoading}
          isEditMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
