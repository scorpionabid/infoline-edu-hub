
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, FileCheck, Info, Check, Clock } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { ColumnValidationError } from '@/types/column';

interface StatusIndicatorsProps {
  errors?: ColumnValidationError[];
  status?: string;
  showMessages?: boolean;
  timestamp?: string;
}

const StatusIndicators: React.FC<StatusIndicatorsProps> = ({ 
  errors = [], 
  status, 
  showMessages = false,
  timestamp 
}) => {
  const { t } = useLanguageSafe();
  const hasErrors = errors && errors.length > 0;

  if (!showMessages) {
    return (
      <>
        {hasErrors && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> {errors.length} {t('error')}
          </Badge>
        )}
        {status === 'submitted' && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="h-3 w-3 mr-1" /> {t('submitted')}
          </Badge>
        )}
        {status === 'approved' && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <FileCheck className="h-3 w-3 mr-1" /> {t('approved')}
          </Badge>
        )}
        {status === 'saving' && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> {t('saving')}
          </Badge>
        )}
        {status === 'saved' && timestamp && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" /> {t('saved')} {timestamp}
          </Badge>
        )}
      </>
    );
  }

  return (
    <>
      {status === 'submitted' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start dark:bg-blue-900/20 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300">{t('dataPendingApproval')}</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">{t('dataBeingReviewed')}</p>
          </div>
        </div>
      )}
      
      {status === 'approved' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-300">{t('dataApproved')}</h4>
            <p className="text-sm text-green-600 dark:text-green-400">{t('dataApprovedDesc')}</p>
          </div>
        </div>
      )}
      
      {hasErrors && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
          <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" /> {t('formHasErrors')}
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
            {errors.slice(0, 3).map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
            {errors.length > 3 && (
              <li>... {t('andOtherErrors')}</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default StatusIndicators;
