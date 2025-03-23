
import { Language } from '@/types/language';
import translations from '@/translations';

/**
 * Tərcümə funksiyası
 * @param key - Tərcümə açarı
 * @param language - İstifadə edilən dil
 * @returns Tərcümə edilmiş mətn
 */
export const translate = (key: string, language: Language): string => {
  if (!translations[language]) {
    console.warn(`Dil tapılmadı: ${language}`);
    return key;
  }

  const translation = translations[language][key];
  if (!translation) {
    console.warn(`Tərcümə tapılmadı: ${key} (${language})`);
    return key;
  }

  return translation;
};

/**
 * Lokal yaddaşdan dil parametrini əldə etmək
 * @returns Saxlanılmış dil və ya default dil
 */
export const getSavedLanguage = (): Language => {
  const savedLanguage = localStorage.getItem('language') as Language;
  return savedLanguage || 'az';
};

/**
 * Lokal yaddaşda dil parametrini saxlamaq
 * @param language - Saxlanılacaq dil
 */
export const saveLanguage = (language: Language): void => {
  localStorage.setItem('language', language);
};
