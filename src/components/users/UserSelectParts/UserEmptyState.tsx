
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export const UserEmptyState: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center py-2 text-muted-foreground">
      {t('noUsersFound') || 'İstifadəçi tapılmadı'}
    </div>
  );
};
