
import React, { useState, useEffect } from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from 'sonner';
import { UserSelect } from '@/components/users/UserSelect';
import { useAssignExistingUserAsSchoolAdmin } from '@/hooks/useAssignExistingUserAsSchoolAdmin';

interface ExistingUserSchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  onSuccess: () => void;
}

export const ExistingUserSchoolAdminDialog: React.FC<ExistingUserSchoolAdminDialogProps> = ({
  isOpen,
  onClose,
  schoolId,
  schoolName,
  onSuccess
}) => {
  const { t } = useLanguageSafe();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { assignUserAsSchoolAdmin, loading } = useAssignExistingUserAsSchoolAdmin();

  // Dialoq bağlandıqda vəziyyətləri sıfırla
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  const onUserSelect = (userId: string) => {
    if (userId !== selectedUserId) {
      setSelectedUserId(userId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !schoolId) {
      toast.error(t('formValidationError'), {
        description: t('pleaseSelectUser')
      });
      return;
    }
    
    try {
      const result = await assignUserAsSchoolAdmin(schoolId, selectedUserId);
      
      if (result.success) {
        setIsSuccess(true);
        
        // 1.5 saniyə sonra dialoqu bağla
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Admin təyin etmə xətası:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('assignExistingUserAsSchoolAdmin')}</DialogTitle>
          <DialogDescription>
            {t('assignExistingUserAsSchoolAdminDesc')}
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-center font-medium text-lg">{t('adminAssigned')}</p>
            <p className="text-center text-muted-foreground">
              {t('adminAssignedDesc')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Məktəb: <span className="font-bold">{schoolName}</span></p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">{t('selectUser')}</label>
                <UserSelect 
                  value={selectedUserId}
                  onChange={onUserSelect} 
                  placeholder={t('selectUserPlaceholder')}
                  disabled={loading}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedUserId || loading}
                className="gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? t('assigning') : t('assign')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
