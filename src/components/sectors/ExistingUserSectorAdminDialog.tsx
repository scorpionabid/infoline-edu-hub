
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminUserSelector } from '@/components/regions/AdminDialog/AdminUserSelector';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { useAssignExistingUserAsSectorAdmin } from '@/hooks/useAssignExistingUserAsSectorAdmin';
import { useAuth } from '@/context/AuthContext';

interface ExistingUserSectorAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
}

export const ExistingUserSectorAdminDialog: React.FC<ExistingUserSectorAdminDialogProps> = ({ 
  open, 
  setOpen, 
  sector,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { users, loading: loadingUsers, error: usersError, fetchAvailableUsers } = useAvailableUsers();
  const { assignUserAsSectorAdmin, loading: assigningAdmin } = useAssignExistingUserAsSectorAdmin();
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
      setError(null);
      setSelectedUserId('');
    }
  }, [open, fetchAvailableUsers]);

  const handleAssign = async () => {
    if (!sector) {
      setError('Sektor mövcud deyil');
      return;
    }
    
    if (!selectedUserId) {
      setError(t('selectUserRequired') || 'Zəhmət olmasa istifadəçi seçin');
      return;
    }
    
    try {
      setError(null);
      
      const result = await assignUserAsSectorAdmin(sector.id, selectedUserId);
      
      if (result.success) {
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      setError(error.message || 'Admin təyin edilərkən xəta baş verdi');
    }
  };

  // Regionadmin istifadəçi seçimlərini filtirləməlidir
  const filteredUsers = React.useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }
    
    // Region admini üçün filtrələmə - yalnız öz regionuna aid və ya rolu olmayan istifadəçilər
    if (user?.role === 'regionadmin' && user.regionId && sector?.region_id) {
      return users.filter(u => 
        !u.role || // rolu olmayanlar
        u.role === 'user' || // sadəcə user olanlar
        (u.regionId === user.regionId && u.role !== 'regionadmin' && u.role !== 'sectoradmin') // eyni regiondakı, amma admin olmayan istifadəçilər
      );
    }
    
    // Superadmin üçün bütün istifadəçiləri göstər
    return users;
  }, [users, user, sector]);

  if (!sector) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignSectorAdmin') || 'Sektor admini təyin et'}</DialogTitle>
          <DialogDescription>
            {t('existingUserAdminHelp') || `Seçilmiş istifadəçi "${sector.name}" sektoru üçün admin səlahiyyətlərinə malik olacaq.`}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {user?.role === 'regionadmin' && (
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('regionAdminPermissionInfo') || 'Siz yalnız öz regionunuza aid istifadəçiləri sektor admini təyin edə bilərsiniz.'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          <AdminUserSelector
            users={filteredUsers}
            loading={loadingUsers}
            error={usersError}
            selectedUserId={selectedUserId}
            onUserChange={(userId) => setSelectedUserId(userId)}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={assigningAdmin}
          >
            {t('cancel') || 'Ləğv et'}
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={assigningAdmin || !selectedUserId}
          >
            {assigningAdmin ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loading') || 'Yüklənir...'}
              </>
            ) : (
              t('assignAdmin') || 'Admin təyin et'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
