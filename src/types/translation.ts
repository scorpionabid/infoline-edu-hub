
export type SupportedLanguage = 'az' | 'en' | 'tr' | 'ru';

export interface TranslationInterpolationOptions {
  [key: string]: string | number;
}

export interface SmartTranslationOptions {
  interpolation?: TranslationInterpolationOptions;
  fallbackKey?: string;
  defaultValue?: string;
}

export interface TranslationValidationOptions {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
}

export interface TranslationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
