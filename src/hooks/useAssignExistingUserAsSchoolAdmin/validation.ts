
import { useLanguage } from "@/context/LanguageContext";

export const useAssignParamValidation = () => {
  const { t } = useLanguage();
  
  const validateParams = (schoolId?: string, userId?: string): { isValid: boolean; errorMessage?: string } => {
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
    
    return { isValid: true };
  };
  
  return { validateParams };
};
