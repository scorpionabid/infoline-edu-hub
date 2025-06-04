
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ValidationError } from '@/hooks/dataEntry/useRealTimeValidation';

export interface ValidationSummaryProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  isValid: boolean;
  className?: string;
}

/**
 * Validation Summary komponenti - forma validasiya nəticələrini göstərir
 */
const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  warnings,
  isValid,
  className = ''
}) => {
  const { t } = useLanguage();
  
  // Əgər heç bir xəta və xəbərdarlıq yoxdursa, uğur mesajı göstər
  if (isValid && warnings.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">{t('validationPassed')}</AlertTitle>
        <AlertDescription className="text-green-700">
          {t('allFieldsValidMessage')}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Xətalar */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {t('validationErrors')} ({errors.length})
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={`error-${index}`} className="text-sm">
                  • {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Xəbərdarlıqlar */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            {t('validationWarnings')} ({warnings.length})
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            <ul className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={`warning-${index}`} className="text-sm">
                  • {warning.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ValidationSummary;
