
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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { UserSelect } from '@/components/users/UserSelect';
import { useAssignExistingUserAsSchoolAdmin } from '@/hooks/useAssignExistingUserAsSchoolAdmin';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const { assignUserAsSchoolAdmin, loading } = useAssignExistingUserAsSchoolAdmin();

  // Dialoq bağlandıqda vəziyyətləri sıfırla
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  // İstifadəçi seçimi dəyişdikdə
  const onUserSelect = (userId: string) => {
    console.log('İstifadəçi seçimi dəyişdi:', userId);
    if (userId !== selectedUserId) {
      setSelectedUserId(userId);
      setError(null); // İstifadəçi dəyişdirildikdə xətanı sıfırla
    }
  };

  // Form təqdimatı
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Form validasiyası
    if (!selectedUserId || !schoolId) {
      const errorMessage = !selectedUserId
        ? t('pleaseSelectUser') || 'Zəhmət olmasa istifadəçi seçin'
        : t('schoolIdNotProvided') || 'Məktəb ID təyin edilməyib';
        
      setError(errorMessage);
      console.error('Form validasiya xətası:', errorMessage);
      
      toast.error(t('formValidationError') || 'Form validasiya xətası', {
        description: errorMessage
      });
      return;
    }
    
    console.log(`Məktəb admini təyin etmə başlayır: Məktəb=${schoolId}, İstifadəçi=${selectedUserId}`);
    
    try {
      const result = await assignUserAsSchoolAdmin(schoolId, selectedUserId);
      
      if (result.success) {
        console.log('Admin təyin etmə uğurlu:', result);
        setIsSuccess(true);
        
        // 1.5 saniyə sonra dialoqu bağla və uğurlu callback-i işlət
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1500);
      } else {
        console.error('Admin təyin etmə uğursuz:', result.error);
        setError(result.error || t('unexpectedError') || 'Bilinməyən xəta');
      }
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      setError(error instanceof Error ? error.message : (t('unexpectedError') || 'Bilinməyən xəta'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('assignExistingUserAsSchoolAdmin') || 'İstifadəçini məktəb admini olaraq təyin et'}</DialogTitle>
          <DialogDescription>
            {t('assignExistingUserAsSchoolAdminDesc') || 'Mövcud bir istifadəçini seçərək məktəb admini kimi təyin edin.'}
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          // Uğurlu təyinat mesajı
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-center font-medium text-lg">{t('adminAssigned') || 'Admin təyin edildi'}</p>
            <p className="text-center text-muted-foreground">
              {t('adminAssignedDesc') || 'İstifadəçi məktəb admini olaraq uğurla təyin edildi'}
            </p>
          </div>
        ) : (
          // Təyinat formu
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Xəta mesajı */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 py-2">
              {/* Məktəb məlumatları */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Məktəb: <span className="font-bold">{schoolName || 'Seçilməmiş'}</span></p>
                <p className="text-sm text-muted-foreground">ID: {schoolId || 'Yoxdur'}</p>
              </div>
              
              {/* İstifadəçi seçimi */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">{t('selectUser') || 'İstifadəçi seçin'}</label>
                <UserSelect 
                  value={selectedUserId}
                  onChange={onUserSelect} 
                  placeholder={t('selectUserPlaceholder') || 'İstifadəçi seçin'}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Dialoq düymələri */}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                {t('cancel') || 'Ləğv et'}
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedUserId || loading}
                className="gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? t('assigning') || 'Təyin edilir...' : t('assign') || 'Təyin et'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
