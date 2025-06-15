
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSwitcher = () => {
  const { t, setLanguage, currentLanguage } = useLanguage();
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  }
  
  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[100px]" aria-label={t('common.selectLanguage')}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue placeholder={t('common.selectLanguage')} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="az">Azərbaycan</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ru">Русский</SelectItem>
        <SelectItem value="tr">Türkçe</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
