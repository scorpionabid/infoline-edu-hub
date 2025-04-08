
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAssignExistingUserAsSchoolAdmin } from '@/hooks/useAssignExistingUserAsSchoolAdmin';
import { AdminDialogHeader } from './admin-dialog/AdminDialogHeader';
import { AdminDialogForm } from './admin-dialog/AdminDialogForm';
import { AdminDialogFooter } from './admin-dialog/AdminDialogFooter';
import { AdminDialogSuccess } from './admin-dialog/AdminDialogSuccess';
import { toast } from 'sonner';

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
    
    // Form validasiyası - boş istifadəçi seçimi üçün
    if (!selectedUserId) {
      const errorMessage = 'Zəhmət olmasa istifadəçi seçin';
      setError(errorMessage);
      return;
    }
    
    console.log(`Məktəb admini təyin etmə başlayır: Məktəb=${schoolId}, İstifadəçi=${selectedUserId}`);
    
    try {
      const result = await assignUserAsSchoolAdmin(schoolId, selectedUserId);
      
      if (result.success) {
        setIsSuccess(true);
        
        // 1.5 saniyə sonra dialoqu bağla və uğurlu callback-i işlət
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1500);
      } else {
        setError(result.error || 'Bilinməyən xəta');
      }
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <AdminDialogHeader schoolName={schoolName} />
        
        {isSuccess ? (
          <AdminDialogSuccess />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminDialogForm
              selectedUserId={selectedUserId}
              onUserSelect={onUserSelect}
              error={error}
              schoolId={schoolId}
              schoolName={schoolName}
              loading={loading}
            />
            
            <AdminDialogFooter
              onClose={onClose}
              onSubmit={handleSubmit}
              loading={loading}
              selectedUserId={selectedUserId}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
