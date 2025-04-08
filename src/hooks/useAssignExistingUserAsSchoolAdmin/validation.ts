
import { useLanguage } from '@/context/LanguageContext';

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export const useAssignParamValidation = () => {
  const { t } = useLanguage();

  const validateParams = (schoolId?: string, userId?: string): ValidationResult => {
    if (!schoolId && !userId) {
      return { 
        isValid: false, 
        errorMessage: t('schoolAndUserIdMissing') || 'Məktəb ID və İstifadəçi ID təyin edilməyib'
      };
    }
    
    if (!schoolId) {
      return { 
        isValid: false, 
        errorMessage: t('schoolIdNotProvided') || 'Məktəb ID təyin edilməyib'
      };
    }
    
    if (!userId) {
      return { 
        isValid: false, 
        errorMessage: t('userIdNotProvided') || 'İstifadəçi ID təyin edilməyib'
      };
    }
    
    return { isValid: true, errorMessage: '' };
  };

  return { validateParams };
};
