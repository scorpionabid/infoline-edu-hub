import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
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
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Dashboard məlumatlarını yeniləmək
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Yeniləmə prosesini simulyasiya edirik
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success(t('dashboard.refresh.success'), {
        description: t('dashboard.refresh.description')
      });
    }, 1000);
  };
  
  // Dövr vaxtını dəyişmək
  const handlePeriodChange = (period: string) => {
    toast.info(t('dashboard.time_period.changed'), {
      description: `${t('dashboard.time_period.changed_to')} ${period}`
    });
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('dashboard.refresh.refreshing') : t('dashboard.refresh.refresh_data')}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {t('dashboard.time_period.this_month')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePeriodChange(t('dashboard.time_period.today'))}>
                {t('dashboard.time_period.today')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('dashboard.time_period.this_week'))}>
                {t('dashboard.time_period.this_week')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('dashboard.time_period.this_month'))}>
                {t('dashboard.time_period.this_month')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('dashboard.time_period.this_quarter'))}>
                {t('dashboard.time_period.this_quarter')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange(t('dashboard.time_period.this_year'))}>
                {t('dashboard.time_period.this_year')}
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
              placeholder={t('dashboard.filters.search_dashboard')} 
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {user?.role === 'superadmin' && (
            <p>
              {t('dashboard.stats.total_schools')}: <span className="font-medium">634</span> | {' '}
              {t('dashboard.stats.active_users')}: <span className="font-medium">912</span>
            </p>
          )}
          {user?.role === 'regionadmin' && (
            <p>
              {t('dashboard.stats.region_schools')}: <span className="font-medium">126</span> | {' '}
              {t('dashboard.stats.active_users')}: <span className="font-medium">158</span>
            </p>
          )}
          {user?.role === 'sectoradmin' && (
            <p>
              {t('dashboard.stats.sector_schools')}: <span className="font-medium">24</span> | {' '}
              {t('dashboard.stats.completion_rate')}: <span className="font-medium">68%</span>
            </p>
          )}
          {user?.role === 'schooladmin' && (
            <p>
              {t('dashboard.stats.pending_forms')}: <span className="font-medium">3</span> | {' '}
              {t('dashboard.stats.completion_rate')}: <span className="font-medium">85%</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;