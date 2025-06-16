
/**
 * Translation system type definitions
 */

export type SupportedLanguage = 'az' | 'en' | 'ru' | 'tr';

export interface TranslationNamespace {
  common: Record<string, any>;
  navigation: Record<string, string>;
  users: Record<string, string>;
  roles: Record<string, string>;
  sectors: Record<string, string>;
  schools: Record<string, string>;
  dashboard: Record<string, string>;
  categories: Record<string, string>;
  columns: Record<string, string>;
  settings: Record<string, string>;
  auth: Record<string, string>;
  statistics: Record<string, string>;
  dialogs: Record<string, string>;
}

export interface TranslationKey {
  namespace: keyof TranslationNamespace;
  key: string;
  fullKey: string;
}

export interface TranslationValidationResult {
  valid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
}

export interface TranslationInterpolationOptions {
  [key: string]: string | number;
}
