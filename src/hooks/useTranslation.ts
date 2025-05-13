
import { useLanguage } from '@/context/LanguageContext';

export const useTranslation = () => {
  return useLanguage();
};

export { useLanguage } from '@/context/LanguageContext';

export default useTranslation;
