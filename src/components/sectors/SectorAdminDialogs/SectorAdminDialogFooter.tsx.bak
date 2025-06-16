
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SectorAdminDialogFooterProps {
  assigningUser: boolean;
  selectedUserId: string;
  onCancel: () => void;
  onAssignAdmin: () => void;
}

export const SectorAdminDialogFooter: React.FC<SectorAdminDialogFooterProps> = ({
  assigningUser,
  selectedUserId,
  onCancel,
  onAssignAdmin
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-end space-x-2 pt-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={assigningUser}
      >
        {t('cancel') || 'İmtina'}
      </Button>
      <Button 
        type="button" 
        onClick={onAssignAdmin}
        disabled={assigningUser || !selectedUserId}
      >
        {assigningUser ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('assigning') || 'Təyin edilir...'}
          </>
        ) : (
          t('assignAdmin') || 'Admin Təyin Et'
        )}
      </Button>
    </div>
  );
};
