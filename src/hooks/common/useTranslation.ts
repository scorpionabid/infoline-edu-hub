import { useContext } from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';

export const useTranslation = () => {
  return useLanguageSafe(); 
};

export { useLanguageSafe as useLanguage };

export default useTranslation;
