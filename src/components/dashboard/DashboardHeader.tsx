
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { ChevronDown, LayoutDashboard, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const DashboardHeader: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Dashboard məlumatlarını yeniləmək
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Yeniləmə prosesini simulyasiya edirik
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success(t('dashboardRefreshed'), {
        description: t('dashboardRefreshedDesc')
      });
    }, 1000);
  };
  
  // Dövr vaxtını dəyişmək
  const handlePeriodChange = (period: string) => {
    toast.info(t('periodChanged'), {
      description: `${t('periodChangedTo')} ${period}`
    });
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">{t('dashboard')}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('refreshing') : t('refresh')}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {t('thisMonth')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePeriodChange(t('today'))}>
                {t('today')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('thisWeek'))}>
                {t('thisWeek')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('thisMonth'))}>
                {t('thisMonth')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('thisQuarter'))}>
                {t('thisQuarter')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('thisYear'))}>
                {t('thisYear')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('searchDashboard')} 
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {user?.role === 'superadmin' && (
            <p>{t('totalSchools')}: <span className="font-medium">634</span> | {t('activeUsers')}: <span className="font-medium">912</span></p>
          )}
          {user?.role === 'regionadmin' && (
            <p>{t('regionSchools')}: <span className="font-medium">126</span> | {t('activeUsers')}: <span className="font-medium">158</span></p>
          )}
          {user?.role === 'sectoradmin' && (
            <p>{t('sectorSchools')}: <span className="font-medium">24</span> | {t('completionRate')}: <span className="font-medium">68%</span></p>
          )}
          {user?.role === 'schooladmin' && (
            <p>{t('pendingForms')}: <span className="font-medium">3</span> | {t('completionRate')}: <span className="font-medium">85%</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
