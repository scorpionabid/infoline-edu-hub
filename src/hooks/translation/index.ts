
// Enhanced translation hooks
export { useSmartTranslation } from './useSmartTranslation';
export { useTranslationValidation } from './useTranslationValidation';

// Legacy compatibility exports from context
export { useOptimizedTranslation } from '@/context/LanguageContext';

// Type exports
export type { 
  SupportedLanguage,
  TranslationInterpolationOptions,
  SmartTranslationOptions
} from '../../types/translation';
