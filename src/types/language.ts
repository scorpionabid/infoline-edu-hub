
// Language types
export type SupportedLanguage = 'az' | 'en' | 'tr' | 'ru';

export interface LanguageContextValue {
  _performance: {
    language: SupportedLanguage;
    isLoading: boolean;
    error: boolean;
  };
  t: (key: string, params?: Record<string, any>) => string;
  tBatch: (keys: string[], params?: Record<string, any>) => Record<string, string>;
  tSafe: (key: string, fallback?: string, params?: Record<string, any>) => string;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLoading: boolean;
  error: Error | null;
}
