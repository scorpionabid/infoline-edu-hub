
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';

interface SectorAdminDialogHeaderProps {
  sector: Sector | null;
  isEmbedded?: boolean;
}

export const SectorAdminDialogHeader: React.FC<SectorAdminDialogHeaderProps> = ({ 
  sector, 
  isEmbedded = false 
}) => {
  const { t } = useLanguage();
  
  if (isEmbedded) return null;
  
  return (
    <DialogHeader>
      <DialogTitle>{t('assignExistingUserAsSectorAdmin') || 'Mövcud istifadəçini sektor admini təyin et'}</DialogTitle>
      <DialogDescription>
        {t('sectorAdminExistingDesc') || `"${sector?.name}" sektoru üçün mövcud istifadəçini admin kimi təyin edin`}
      </DialogDescription>
    </DialogHeader>
  );
};
