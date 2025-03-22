
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileUp, FileDown, Plus, RefreshCcw } from 'lucide-react';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Cari vaxtı yeniləmək üçün interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // hər dəqiqə yenilə
    
    return () => clearInterval(timer);
  }, []);

  // Tarixi formatla
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(
      t('currentLanguage') === 'az' ? 'az-AZ' : 
      t('currentLanguage') === 'ru' ? 'ru-RU' : 
      t('currentLanguage') === 'tr' ? 'tr-TR' : 'en-US', 
      { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
    );
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-muted-foreground">{t('welcomeBack')}, {user?.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{formatDate(currentDateTime)}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <FileUp className="h-4 w-4" />
            <span>{t('import')}</span>
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <FileDown className="h-4 w-4" />
            <span>{t('export')}</span>
          </Button>
          {user?.role === 'superadmin' || user?.role === 'regionadmin' ? (
            <Button size="sm" variant="default" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>{t('add')}</span>
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            <span>{t('refresh')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
