
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguageSafe } from '@/context/LanguageContext';

interface ApprovalAlertProps {
  isApproved?: boolean;
}

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ApprovalAlert: React.FC<ApprovalAlertProps> = ({ isApproved = false }) => {
  const { t } = useLanguageSafe();
  
  if (!isApproved) return null;
  
  return (
    <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
      <CheckIcon className="h-4 w-4" />
      <AlertTitle>{t('categoryApproved')}</AlertTitle>
      <AlertDescription>
        {t('categoryApprovedDesc')}
      </AlertDescription>
    </Alert>
  );
};

export default ApprovalAlert;
