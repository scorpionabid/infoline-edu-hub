
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSelector = () => {
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('language')}
          title={t('language')}
        >
          <Globe className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(languages).map(([code, language]) => (
          <DropdownMenuItem
            key={code}
            className={`flex items-center justify-between ${
              currentLanguage === code ? 'font-semibold bg-accent/50' : ''
            }`}
            onClick={() => handleSelectLanguage(code as Language)}
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
