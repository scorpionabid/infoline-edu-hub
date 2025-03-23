
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/types/language';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSelector = () => {
  const { language, setLanguage, languages, t } = useLanguage();
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
        {Object.entries(languages).map(([code, langInfo]) => (
          <DropdownMenuItem
            key={code}
            className={`flex items-center justify-between ${
              language === code ? 'font-semibold bg-accent/50' : ''
            }`}
            onClick={() => handleSelectLanguage(code as Language)}
          >
            <span className="mr-2">{langInfo.flag}</span>
            <span>{langInfo.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
