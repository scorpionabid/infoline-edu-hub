import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Supported languages with their display names and flags
const LANGUAGES = {
  en: { nativeName: 'English', flag: '🇬🇧' },
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
} as const;

type LanguageCode = keyof typeof LANGUAGES;

// Default language to use when context is not available
const DEFAULT_LANGUAGE: LanguageCode = 'az';

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

interface LanguageSwitcherProps {
  /**
   * Optional class name for the root element
   */
  className?: string;
  /**
   * Optional size variant
   */
  variant?: 'default' | 'sm' | 'lg';
  /**
   * Optional flag to show/hide labels
   */
  showLabels?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'default',
  showLabels = true
}) => {
  try {
    // Safely get translation context with defaults
    const translationContext = useTranslation?.();
    const { t, language = DEFAULT_LANGUAGE, setLanguage } = translationContext || {};
    
    // Get available languages
    const availableLanguages = Object.keys(LANGUAGES) as LanguageCode[];
    const currentLanguage = availableLanguages.includes(language as LanguageCode) 
      ? language as LanguageCode 
      : DEFAULT_LANGUAGE;

    // Handle language change with error handling
    const handleLanguageChange = (value: string) => {
      try {
        if (setLanguage && availableLanguages.includes(value as LanguageCode)) {
          setLanguage(value as LanguageCode);
          console.log(`Language changed to: ${value}`);
        } else {
          console.warn(`Cannot set language to ${value}: setLanguage not available or invalid language`);
        }
      } catch (error) {
        console.error('Error changing language:', error);
      }
    };

    // Don't render if translation context is not available
    if (!setLanguage) {
      console.warn('LanguageSwitcher: No translation context available');
      return null;
    }

    // Fallback for missing translation
    const selectLanguageLabel = t?.('ui.selectLanguage') || 'Select Language';

    // Determine size classes based on variant
    const sizeClasses = {
      sm: 'h-8 text-sm',
      default: 'h-10 text-base',
      lg: 'h-12 text-lg'
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabels && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {t?.('language_switcher.label', { defaultValue: 'Language' })}
          </span>
        )}
        <Select
          value={currentLanguage}
          onValueChange={handleLanguageChange}
          aria-label={t?.('language_switcher.aria_label', { defaultValue: 'Select language' }) || 'Select language'}
        >
          <SelectTrigger 
            className={`w-auto min-w-[120px] border-border ${sizeClasses[variant]}`}
          >
            <div className="flex items-center gap-2 w-full">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <SelectValue placeholder={
                t?.('language_switcher.placeholder', { defaultValue: 'Language' })
              } />
            </div>
          </SelectTrigger>
          <SelectContent className="min-w-[180px]">
            {availableLanguages.map((lang) => {
              const langInfo = LANGUAGES[lang];
              return (
                <SelectItem 
                  key={lang} 
                  value={lang}
                  className="py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{langInfo.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{langInfo.nativeName}</span>
                      <span className="text-xs text-muted-foreground">
                        {t?.(`languages.${lang}`, { defaultValue: lang.toUpperCase() })}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  } catch (error) {
    console.error('Error in LanguageSwitcher:', error);
    return null;
  }
};

/**
 * LanguageSwitcher with error boundary and safe defaults
 */
const SafeLanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const fallbackUI = (
    <div 
      className="flex items-center gap-2 p-2 text-muted-foreground/50"
      aria-hidden="true"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm">Language</span>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI}>
      <React.Suspense fallback={fallbackUI}>
        <LanguageSwitcher {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
};  

export default SafeLanguageSwitcher;
