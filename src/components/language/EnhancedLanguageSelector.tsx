
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLanguageSelectorProps {
  variant?: 'default' | 'compact' | 'minimal';
  showText?: boolean;
  className?: string;
}

const EnhancedLanguageSelector: React.FC<EnhancedLanguageSelectorProps> = ({
  variant = 'default',
  showText = true,
  className
}) => {
  const { t, languages, currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const getCurrentLanguageInfo = () => {
    return languages[currentLanguage] || { nativeName: 'Language', flag: '🌐' };
  };

  const buttonVariants = {
    default: "ghost",
    compact: "outline",
    minimal: "ghost"
  } as const;

  const buttonSizes = {
    default: "default",
    compact: "sm", 
    minimal: "sm"
  } as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={buttonVariants[variant]}
          size={buttonSizes[variant]}
          className={cn(
            "flex items-center gap-2",
            variant === 'minimal' && "p-2",
            className
          )}
          aria-label={t('selectLanguage')}
        >
          <Globe className="h-4 w-4" />
          {showText && variant !== 'minimal' && (
            <>
              <span className="hidden sm:inline">
                {getCurrentLanguageInfo().flag}
              </span>
              <span className="hidden md:inline">
                {getCurrentLanguageInfo().nativeName}
              </span>
            </>
          )}
          {variant === 'compact' && (
            <span className="text-xs">
              {currentLanguage.toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{languages[lang]?.flag}</span>
              <span>{languages[lang]?.nativeName}</span>
            </div>
            {lang === currentLanguage && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedLanguageSelector;
