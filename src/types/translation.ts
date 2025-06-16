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
  core: TranslationModule;
  dashboard: TranslationModule;
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
  userManagement: TranslationModule;
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
  coverage?: number;
}

export interface TranslationInterpolationOptions {
  [key: string]: string | number;
}

// Helper type to extract all possible translation keys
export type AllTranslationKeys = {
  [K in keyof TranslationModules]: TranslationKeyPath<TranslationModules[K]>;
}[keyof TranslationModules];

// Enhanced translation hook return type
export interface TranslationHookReturn {
  t: (key: string, options?: TranslationInterpolationOptions) => string;
  tSafe: (key: string, fallback?: string) => string;
  tContext: (key: string, context: Record<string, any>) => string;
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

// Translation validation and coverage types
export interface TranslationCoverage {
  [module: string]: {
    completed: boolean;
    percentage: number;
    missingKeys?: string[];
    totalKeys?: number;
  };
}

export interface TranslationAudit {
  coverage: TranslationCoverage;
  hardcodedTexts: HardcodedText[];
  duplicateKeys: string[];
  unusedKeys: string[];
  performance: {
    loadTime: number;
    cacheHitRate: number;
  };
}

export interface HardcodedText {
  file: string;
  line: number;
  text: string;
  suggestedKey?: string;
  module?: string;
}

// Smart translation options
export interface SmartTranslationOptions {
  fallback?: string;
  defaultValue?: string;
  interpolation?: TranslationInterpolationOptions;
  module?: string;
  context?: string;
  warnMissing?: boolean;
}
