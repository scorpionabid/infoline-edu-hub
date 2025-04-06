
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';

interface AdminDialogHeaderProps {
  region: Region;
}

export const AdminDialogHeader: React.FC<AdminDialogHeaderProps> = ({ region }) => {
  const { t } = useLanguage();
  
  return (
    <DialogHeader>
      <DialogTitle>{t('assignRegionAdmin') || 'Region admini təyin et'}</DialogTitle>
      <DialogDescription>
        {t('existingUserAdminHelp') || `"${region.name}" regionu üçün seçilmiş istifadəçi admin səlahiyyətlərinə malik olacaq.`}
      </DialogDescription>
    </DialogHeader>
  );
};
