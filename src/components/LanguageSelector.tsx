
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguageSafe, Language } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface LanguageInfo {
  flag: string;
  nativeName: string;
}

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguageSafe();
  const [open, setOpen] = useState(false);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  // Əgər availableLanguages undefined olarsa, əlavə yoxlama edirik
  const languages = availableLanguages || {
    az: { flag: '🇦🇿', nativeName: 'Azərbaycan' },
    en: { flag: '🇬🇧', nativeName: 'English' },
    ru: { flag: '🇷🇺', nativeName: 'Русский' },
    tr: { flag: '🇹🇷', nativeName: 'Türkçe' }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('language')}
          title={t('language')}
          className="bg-transparent border-none p-0 m-0"
        >
          <Globe className="h-5 w-5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(languages).map(([code, langInfo]) => (
          <DropdownMenuItem
            key={code}
            className={`flex items-center justify-between ${
              currentLanguage === code ? 'font-semibold bg-accent/50' : ''
            }`}
            onClick={() => handleSelectLanguage(code as Language)}
          >
            <span className="mr-2">{(langInfo as LanguageInfo).flag}</span>
            <span>{(langInfo as LanguageInfo).nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
