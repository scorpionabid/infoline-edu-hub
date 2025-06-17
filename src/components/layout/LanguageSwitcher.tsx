
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
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
} as const;

type LanguageCode = keyof typeof LANGUAGES;

// Default language is Azerbaijani
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
  className?: string;
  variant?: 'default' | 'sm' | 'lg';
  showLabels?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'default',
  showLabels = false
}) => {
  try {
    const translationContext = useTranslation?.();
    const { t, language = DEFAULT_LANGUAGE, setLanguage } = translationContext || {};
    
    const availableLanguages = Object.keys(LANGUAGES) as LanguageCode[];
    const currentLanguage = availableLanguages.includes(language as LanguageCode) 
      ? language as LanguageCode 
      : DEFAULT_LANGUAGE;

    const handleLanguageChange = (value: string) => {
      try {
        if (setLanguage && availableLanguages.includes(value as LanguageCode)) {
          setLanguage(value as LanguageCode);
          console.log(`Language changed to: ${value}`);
        }
      } catch (error) {
        console.error('Error changing language:', error);
      }
    };

    if (!setLanguage) {
      return null;
    }

    const sizeClasses = {
      sm: 'h-8 text-sm',
      default: 'h-10 text-base',
      lg: 'h-12 text-lg'
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabels && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {t?.('ui.language') || 'Dil'}
          </span>
        )}
        <Select
          value={currentLanguage}
          onValueChange={handleLanguageChange}
          aria-label="Dil seçin"
        >
          <SelectTrigger 
            className={`w-auto min-w-[120px] border-border ${sizeClasses[variant]}`}
          >
            <div className="flex items-center gap-2 w-full">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <SelectValue />
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

const SafeLanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const fallbackUI = (
    <div 
      className="flex items-center gap-2 p-2 text-muted-foreground/50"
      aria-hidden="true"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm">Dil</span>
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
