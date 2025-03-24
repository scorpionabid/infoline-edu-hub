
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface ApprovalAlertProps {
  isApproved: boolean;
}

const ApprovalAlert: React.FC<ApprovalAlertProps> = ({ isApproved }) => {
  const { t } = useLanguage();
  
  if (!isApproved) return null;
  
  return (
    <Alert className="mb-4 bg-green-50 border-green-100 text-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{t('categoryApproved')}</AlertTitle>
      <AlertDescription>
        {t('categoryApprovedDesc')}
      </AlertDescription>
    </Alert>
  );
};

export default ApprovalAlert;
