
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/region';

interface AdminDialogHeaderProps {
  region: Region;
}

export const AdminDialogHeader: React.FC<AdminDialogHeaderProps> = ({ region }) => {
  const { t } = useLanguage();

  return (
    <DialogHeader>
      <DialogTitle>{t('assignRegionAdmin') || 'Region admini təyin et'}</DialogTitle>
      <DialogDescription>
        {t("assignRegionAdminDesc") || `"${region.name}" regionu üçün admin təyin edin`}
      </DialogDescription>
    </DialogHeader>
  );
};
