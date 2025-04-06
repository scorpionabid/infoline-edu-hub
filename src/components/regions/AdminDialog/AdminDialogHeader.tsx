
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminDialogHeaderProps {
  region: Region | null;
}

export const AdminDialogHeader: React.FC<AdminDialogHeaderProps> = ({ region }) => {
  const { t } = useLanguage();
  
  if (!region) return null;
  
  return (
    <DialogHeader>
      <DialogTitle>{t('assignRegionAdmin') || 'Region admini təyin et'}</DialogTitle>
      <DialogDescription>
        {`"${region.name}" regionu üçün mövcud istifadəçini admin kimi təyin edin`}
      </DialogDescription>
    </DialogHeader>
  );
};
