
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

export const LanguageSwitcher = () => {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  
  return (
    <Select value={currentLanguage} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[100px]" aria-label={t('selectLanguage')}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue placeholder={t('selectLanguage')} />
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
