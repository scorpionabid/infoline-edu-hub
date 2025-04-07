
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
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        {t('cancel') || 'Ləğv et'}
      </Button>
      <Button 
        onClick={onAssignAdmin}
        disabled={!selectedUserId || assigningUser}
      >
        {assigningUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('assignAdmin') || 'Admin təyin et'}
      </Button>
    </div>
  );
};
