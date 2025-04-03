
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  refreshData?: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ refreshData }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Məlumatları yeniləmək üçün handler
  const handleRefresh = async () => {
    if (refreshData) {
      try {
        toast.info(t('refreshingData'));
        await refreshData();
        toast.success(t('dataRefreshed'));
      } catch (error) {
        console.error('Data yenilənərkən xəta:', error);
        toast.error(t('refreshError'));
      }
    }
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };
  
  // Get name to display
  const displayName = user?.name || user?.email?.split('@')[0] || t('user');
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {displayName}</h1>
        <p className="text-muted-foreground">
          {t('dashboardSubtitle')}
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        {t('refreshData')}
      </Button>
    </div>
  );
};

export default DashboardHeader;
