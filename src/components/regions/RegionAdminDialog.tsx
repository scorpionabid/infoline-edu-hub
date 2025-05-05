
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSuperUsers } from '@/hooks/useSuperUsers';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionAdmins } from '@/hooks/useRegionAdmins';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regionId: string;
}

const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({ open, onOpenChange, regionId }) => {
  const { t } = useLanguage();
  const { users, loading: loadingUsers } = useSuperUsers();
  const { assignAdmin, loading: assigningAdmin } = useRegionAdmins();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Dialog bağlandığında seçilmiş istifadəçini təmizləyirik
  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
    }
  }, [open]);

  const handleAssignAdmin = async () => {
    if (!selectedUserId) {
      toast.error(t('pleaseSelectAdmin'));
      return;
    }
    
    try {
      const result = await assignAdmin(selectedUserId, regionId);
      
      if (result.success) {
        toast.success(t('adminAssignedSuccessfully'));
        onOpenChange(false);
      } else {
        toast.error(t('errorAssigningAdmin'), {
          description: result.error
        });
      }
    } catch (error) {
      toast.error(t('errorAssigningAdmin'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('assignRegionAdmin')}</DialogTitle>
          <DialogDescription>
            {t('assignRegionAdminDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={loadingUsers}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('selectUser')} />
            </SelectTrigger>
            <SelectContent>
              {loadingUsers ? (
                <SelectItem value="loading" disabled>
                  {t('loading')}
                </SelectItem>
              ) : users.length === 0 ? (
                <SelectItem value="no-users" disabled>
                  {t('noUsersFound')}
                </SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={assigningAdmin}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleAssignAdmin}
            disabled={!selectedUserId || assigningAdmin}
          >
            {assigningAdmin ? t('assigning') : t('assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegionAdminDialog;
