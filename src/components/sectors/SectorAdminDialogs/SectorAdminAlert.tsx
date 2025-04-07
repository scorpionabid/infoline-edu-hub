
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SectorAdminAlertProps {
  error: string | null;
  usersError: Error | null;
}

export const SectorAdminAlert: React.FC<SectorAdminAlertProps> = ({ error, usersError }) => {
  const { t } = useLanguage();
  
  if (!error && !usersError) return null;
  
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {usersError && !error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('errorLoadingUsers') || 'İstifadəçilər yüklənərkən xəta'}: {usersError.message}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
