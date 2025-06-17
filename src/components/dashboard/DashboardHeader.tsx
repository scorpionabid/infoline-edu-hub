
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
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Məlumatlar yeniləndi");
    }, 1000);
  };
  
  const handlePeriodChange = (period: string) => {
    toast.info("Dövr dəyişdirildi");
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">İdarə Paneli</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Yüklənir..." : "Yenilə"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bu ay
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePeriodChange("Bu gün")}>
                Bu gün
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("Bu həftə")}>
                Bu həftə
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("Bu ay")}>
                Bu ay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("Bu il")}>
                Bu il
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
              placeholder="Dashboard-da axtar" 
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {user?.role === 'superadmin' && (
            <p>
              Ümumi məktəblər: <span className="font-medium">634</span> | {' '}
              Aktiv istifadəçilər: <span className="font-medium">912</span>
            </p>
          )}
          {user?.role === 'regionadmin' && (
            <p>
              Region məktəbləri: <span className="font-medium">126</span> | {' '}
              Aktiv istifadəçilər: <span className="font-medium">158</span>
            </p>
          )}
          {user?.role === 'sectoradmin' && (
            <p>
              Sektor məktəbləri: <span className="font-medium">24</span> | {' '}
              Tamamlanma faizi: <span className="font-medium">68%</span>
            </p>
          )}
          {user?.role === 'schooladmin' && (
            <p>
              Gözləyən formlar: <span className="font-medium">3</span> | {' '}
              Tamamlanma faizi: <span className="font-medium">85%</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
