
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdminDialogFooterProps {
  loading: boolean;
  onCancel: () => void;
  onAssign: () => void;
  disabled: boolean;
}

export const AdminDialogFooter: React.FC<AdminDialogFooterProps> = ({
  loading,
  onCancel,
  onAssign,
  disabled
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-end">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="mr-2"
        disabled={loading}
      >
        {t("cancel") || 'Ləğv et'}
      </Button>
      <Button 
        type="button" 
        onClick={onAssign} 
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("loading") || 'Yüklənir...'}
          </>
        ) : (
          t("assignAdmin") || 'Admin təyin et'
        )}
      </Button>
    </div>
  );
};
