// Enhanced translation hooks
export { useSmartTranslation } from './useSmartTranslation';

// Legacy compatibility exports
export { 
  useLanguage, 
  useLanguageSafe, 
  useOptimizedTranslation 
} from '../../context/LanguageContext';

// Main translation context
export { 
  useTranslation, 
  TranslationProvider 
} from '../../contexts/TranslationContext';

// Type exports
export type { 
  SupportedLanguage,
  TranslationInterpolationOptions,
  SmartTranslationOptions
} from '../../types/translation';
