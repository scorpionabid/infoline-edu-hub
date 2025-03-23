
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface RejectionAlertProps {
  errorMessage: string;
  isRejected?: boolean;
}

const RejectionAlert: React.FC<RejectionAlertProps> = ({ 
  errorMessage, 
  isRejected = false 
}) => {
  const { t } = useLanguage();
  
  if (!isRejected && !errorMessage) return null;
  
  return (
    <Alert className="mb-4 bg-red-50 border-red-100 text-red-800">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{t('categoryRejected')}</AlertTitle>
      <AlertDescription>
        {errorMessage || t('fixErrorsAndResubmit')}
      </AlertDescription>
    </Alert>
  );
};

export default RejectionAlert;
