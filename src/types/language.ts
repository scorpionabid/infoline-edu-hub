
// Dil tiplərini müəyyən edirik
export type Language = 'az' | 'en' | 'ru' | 'tr';

// Dil məlumatları interfeysi
export interface LanguageInfo {
  nativeName: string;
  flag: string;
}

// Translate funksiyasının interfeysi
export type TranslateFunction = (key: string) => string;

// Context tipi
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslateFunction;
  languages: { value: Language, label: string, flag: string, nativeName: string }[];
}
