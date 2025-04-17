import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language, LanguageInfo } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const LanguageSelector: React.FC = () => {
  // languages hook-dan alınır, amma undefined ola bilər, ona görə default dəyər verilir
  const { language, setLanguage, languages = {}, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
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
              language === code ? 'font-semibold bg-accent/50' : ''
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