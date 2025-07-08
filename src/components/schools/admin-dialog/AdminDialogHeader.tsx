
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/contexts/TranslationContext';

interface AdminDialogHeaderProps {
  schoolName: string;
}

export const AdminDialogHeader: React.FC<AdminDialogHeaderProps> = ({ schoolName }) => {
  const { t } = useTranslation();
  
  return (
    <DialogHeader>
      <DialogTitle>{t('assignExistingUserAsSchoolAdmin') || 'İstifadəçini məktəb admini olaraq təyin et'}</DialogTitle>
      <DialogDescription>
        {t('assignExistingUserAsSchoolAdminDesc') || 'Mövcud bir istifadəçini seçərək məktəb admini kimi təyin edin.'}
        {schoolName && <span className="font-medium block mt-1">Məktəb: {schoolName}</span>}
      </DialogDescription>
    </DialogHeader>
  );
};
