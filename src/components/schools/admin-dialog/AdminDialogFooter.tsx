
import React from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdminDialogFooterProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  selectedUserId: string;
}

export const AdminDialogFooter: React.FC<AdminDialogFooterProps> = ({
  onClose,
  onSubmit,
  loading,
  // selectedUserId
}) => {
  const { t } = useLanguageSafe();
  
  return (
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
        onClick={onSubmit}
        disabled={!selectedUserId || loading}
        className="gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t('assigning') || 'Təyin edilir...' : t('assign') || 'Təyin et'}
      </Button>
    </DialogFooter>
  );
};
