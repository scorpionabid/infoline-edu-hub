
/**
 * Translation system type definitions
 */

export type SupportedLanguage = 'az' | 'en' | 'ru' | 'tr';

// Module types based on our generated structure
export type TranslationModule = {
  [key: string]: string | Record<string, any>;
};

// Type for the complete translations for a language
export type LanguageTranslations = {
  auth: TranslationModule;
  categories: TranslationModule;
  dataEntry: TranslationModule;
  feedback: TranslationModule;
  general: TranslationModule;
  navigation: TranslationModule;
  notifications: TranslationModule;
  organization: TranslationModule;
  profile: TranslationModule;
  schools: TranslationModule;
  status: TranslationModule;
  time: TranslationModule;
  ui: TranslationModule;
  user: TranslationModule;
  validation: TranslationModule;
};

// Type for the translation modules
export type TranslationModules = {
  [K in keyof LanguageTranslations]: LanguageTranslations[K];
};

// Type for translation key paths
export type TranslationKeyPath<T extends Record<string, any>, P extends string = ''> = {
  [K in keyof T]: T[K] extends string
    ? P extends '' ? K : `${P}.${K & string}`
    : T[K] extends Record<string, any>
      ? TranslationKeyPath<T[K], P extends '' ? K & string : `${P}.${K & string}`>
      : never;
}[keyof T];

export interface TranslationValidationResult {
  valid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
  missingGroups?: string[];
}

export interface TranslationInterpolationOptions {
  [key: string]: string | number;
}

// Helper type to extract all possible translation keys
export type AllTranslationKeys = {
  [K in keyof TranslationModules]: TranslationKeyPath<TranslationModules[K]>;
}[keyof TranslationModules];
