
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard')}</h1>
        <p className="text-muted-foreground">{t('welcomeBack')}, {user?.name}</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
