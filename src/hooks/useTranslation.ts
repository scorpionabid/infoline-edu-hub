
import { useLanguage } from '@/context/LanguageContext';

export const useTranslation = () => {
  return useLanguage();
};

export { useLanguage };

export default useTranslation;
