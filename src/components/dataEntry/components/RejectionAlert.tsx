
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface RejectionAlertProps {
  errorMessage?: string;
}

const RejectionAlert: React.FC<RejectionAlertProps> = ({ errorMessage }) => {
  const { t } = useLanguage();
  
  if (!errorMessage) return null;
  
  return (
    <Alert variant="destructive" className="py-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-sm ml-2">{t('rejectionReason')}</AlertTitle>
      <AlertDescription className="text-sm ml-2">
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
};

export default RejectionAlert;
