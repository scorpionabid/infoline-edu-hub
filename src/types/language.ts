
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
  setLanguage: (lang: Language) => void;
  t: TranslateFunction;
  languages: Record<Language, LanguageInfo>;
  currentLanguage: Language;
}
