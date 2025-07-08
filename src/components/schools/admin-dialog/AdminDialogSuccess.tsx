
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { CheckCircle2 } from 'lucide-react';

export const AdminDialogSuccess: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <p className="text-center font-medium text-lg">{t('adminAssigned') || 'Admin təyin edildi'}</p>
      <p className="text-center text-muted-foreground">
        {t('adminAssignedDesc') || 'İstifadəçi məktəb admini olaraq uğurla təyin edildi'}
      </p>
    </div>
  );
};
