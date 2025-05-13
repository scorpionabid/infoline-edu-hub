
import { useLanguage } from '@/context/LanguageContext';

export const useTranslation = () => {
  return useLanguage();
};

export default useTranslation;
