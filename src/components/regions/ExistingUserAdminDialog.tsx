
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAssignExistingUserAsAdmin } from '@/hooks/useAssignExistingUserAsAdmin';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';

// İmport komponentləri
import { AdminDialogHeader } from './AdminDialog/AdminDialogHeader';
import { AdminUserSelector } from './AdminDialog/AdminUserSelector';
import { AdminDialogFooter } from './AdminDialog/AdminDialogFooter';

interface ExistingUserAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  region: Region | null;
  onSuccess?: () => void;
}

export const ExistingUserAdminDialog: React.FC<ExistingUserAdminDialogProps> = ({ 
  open, 
  setOpen, 
  region,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { assignUserAsRegionAdmin, loading: assignLoading } = useAssignExistingUserAsAdmin();
  const { users, loading: usersLoading, error: usersError, fetchAvailableUsers } = useAvailableUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Dialog açıldığında istifadəçiləri yenidən əldə et
  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
      setSelectedUserId('');
      setError(null);
    }
  }, [open, fetchAvailableUsers]);
  
  // İstifadəçi seçimi dəyişdikdə
  const handleUserChange = (value: string) => {
    setSelectedUserId(value);
    setError(null);
  };
  
  // Admin təyin etmə prosesi
  const handleAssignAdmin = async () => {
    if (!selectedUserId) {
      setError(t('selectUserRequired') || 'Zəhmət olmasa istifadəçi seçin');
      return;
    }
    
    if (!region) {
      setError(t('regionNotFound') || 'Region tapılmadı');
      return;
    }

    console.log('Təyin edilmə başladı. Region ID:', region.id, 'User ID:', selectedUserId);
    
    try {
      const result = await assignUserAsRegionAdmin(region.id, selectedUserId);
      
      if (result.success) {
        console.log('Təyin etmə uğurla başa çatdı', result);
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Təyin etmə xətası:', result.error);
        setError(result.error);
      }
    } catch (err: any) {
      console.error('Təyin etmə zamanı istisna:', err);
      setError(err.message || t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta baş verdi');
    }
  };

  if (!region) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && setOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <AdminDialogHeader region={region} />
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          <AdminUserSelector 
            users={users}
            loading={usersLoading}
            error={usersError}
            selectedUserId={selectedUserId}
            onUserChange={handleUserChange}
          />
          
          <AdminDialogFooter 
            loading={assignLoading}
            onCancel={() => setOpen(false)}
            onAssign={handleAssignAdmin}
            disabled={!selectedUserId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
