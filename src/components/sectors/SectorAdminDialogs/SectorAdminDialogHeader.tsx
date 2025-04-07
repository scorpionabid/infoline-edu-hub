
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SectorAdminDialogHeaderProps {
  sector: Sector | null;
  isEmbedded?: boolean;
}

export const SectorAdminDialogHeader: React.FC<SectorAdminDialogHeaderProps> = ({ 
  sector,
  isEmbedded = false 
}) => {
  const { t } = useLanguage();
  
  if (!sector) return null;
  
  if (isEmbedded) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          {t('selectUserToAssign') || 'Təyin ediləcək istifadəçini seçin'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {/* Parametrləşdirmə üsulunu düzəldirik */}
          {t('selectUserToAssignDesc', { sectorName: sector.name }) || 
            `"${sector.name}" sektoru üçün admin olaraq təyin ediləcək istifadəçini seçin`}
        </p>
      </div>
    );
  }
  
  return (
    <DialogHeader>
      <DialogTitle>{t('assignSectorAdmin') || 'Sektor Admini Təyin Et'}</DialogTitle>
      <DialogDescription>
        {/* Parametrləşdirmə üsulunu düzəldirik */}
        {t('assignSectorAdminDesc', { sectorName: sector.name }) || 
          `"${sector.name}" sektoru üçün admin təyin edin`}
      </DialogDescription>
    </DialogHeader>
  );
};
