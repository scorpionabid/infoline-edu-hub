
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { Language } from '@/types/language';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, languages } = useLanguage();
  
  // Dil seçimi üçün funksiya
  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Dil seçin">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, langInfo]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageSelect(code as Language)}
            className={language === code ? 'bg-muted' : ''}
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
