
import { useLanguage } from '@/context/LanguageContext';

// Re-export useLanguage as useTranslation for compatibility
export const useTranslation = () => {
  return useLanguage();
};

export default useTranslation;
