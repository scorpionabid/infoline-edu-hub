
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAvailableUsers } from '@/hooks/user/useAvailableUsers';
import { supabase } from '@/integrations/supabase/client';

interface ExistingUserSchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  onSuccess: () => void;
}

const ExistingUserSchoolAdminDialog: React.FC<ExistingUserSchoolAdminDialogProps> = ({
  isOpen,
  onClose,
  schoolId,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { data: availableUsers = [], isLoading } = useAvailableUsers();

  const handleAssign = async () => {
    if (!selectedUserId || !schoolId) return;

    setIsAssigning(true);
    try {
      // Get school data to retrieve region_id and sector_id
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();

      if (schoolError) throw schoolError;

      // Call the assign_school_admin function
      const { data, error } = await supabase.rpc('assign_school_admin', {
        user_id_param: selectedUserId,
        school_id_param: schoolId
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t('success'),
          description: t('schoolAdminAssignedSuccessfully'),
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(data?.error || 'Assignment failed');
      }
    } catch (error: any) {
      console.error('Error assigning school admin:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorAssigningSchoolAdmin'),
        variant: 'destructive'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('assignExistingUser')}</DialogTitle>
          <DialogDescription>
            {t('selectUserToAssignAsSchoolAdmin')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>{t('selectUser')}</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectUser')} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.name} ({user.email || 'No email'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedUserId || isAssigning || isLoading}
            >
              {isAssigning ? t('assigning') : t('assign')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingUserSchoolAdminDialog;
