import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type DashboardStats = {
  schoolCount: number;
  activeUserCount: number;
  completionPercentage: number;
  pendingFormCount: number;
};

const DashboardHeader: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    schoolCount: 0,
    activeUserCount: 0,
    completionPercentage: 0,
    pendingFormCount: 0
  });
  
  // Fetch dashboard statistics based on user role
  // Memoize the fetch function to prevent infinite re-renders
  const fetchDashboardStats = React.useCallback(async () => {
    if (!user) return;
    
    try {
      let schoolCount = 0;
      let activeUserCount = 0;
      let completionPercentage = 0;
      let pendingFormCount = 0;
      
      if (user.role === 'regionadmin' && user.region_id) {
        // Count schools in this region
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('id')
          .eq('region_id', user.region_id);
          
        if (schoolsError) {
          console.error('Error fetching schools:', schoolsError);
          throw schoolsError;
        }
        
        schoolCount = schools?.length || 0;
        
        // Count active users in this region
        const { data: users, error: usersError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('region_id', user.region_id);
          
        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }
        
        activeUserCount = users?.length || 0;
      } 
      else if (user.role === 'sectoradmin' && user.sector_id) {
        // Count schools in this sector
        const { data: schools, error: sectorSchoolsError } = await supabase
          .from('schools')
          .select('id')
          .eq('sector_id', user.sector_id);
          
        if (sectorSchoolsError) {
          console.error('Error fetching sector schools:', sectorSchoolsError);
          throw sectorSchoolsError;
        }
        
        schoolCount = schools?.length || 0;
        
        // Calculate completion percentage (this is an example - adjust to your actual data model)
        const { data: entries, error: entriesError } = await supabase
          .from('data_entries')
          .select('status')
          .eq('sector_id', user.sector_id);
          
        if (entriesError) {
          console.error('Error fetching sector entries:', entriesError);
          throw entriesError;
        }
        
        if (entries && entries.length > 0) {
          const completedEntries = entries.filter(e => e.status === 'completed').length;
          completionPercentage = Math.round((completedEntries / entries.length) * 100);
        }
      }
      else if (user.role === 'schooladmin' && user.school_id) {
        // Count pending forms
        const { data: pendingForms, error: formsError } = await supabase
          .from('data_entries')
          .select('id')
          .eq('school_id', user.school_id)
          .eq('status', 'pending');
          
        if (formsError) {
          console.error('Error fetching pending forms:', formsError);
          throw formsError;
        }
        
        pendingFormCount = pendingForms?.length || 0;
        
        // Calculate completion percentage
        const { data: entries, error: schoolEntriesError } = await supabase
          .from('data_entries')
          .select('status')
          .eq('school_id', user.school_id);
          
        if (schoolEntriesError) {
          console.error('Error fetching school entries:', schoolEntriesError);
          throw schoolEntriesError;
        }
        
        if (entries && entries.length > 0) {
          const completedEntries = entries.filter(e => e.status === 'completed').length;
          completionPercentage = Math.round((completedEntries / entries.length) * 100);
        }
      }
      
      setStats({
        schoolCount,
        activeUserCount,
        completionPercentage,
        pendingFormCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, [user]);

  // Fetch stats on component mount and when user changes
  useEffect(() => {
    fetchDashboardStats();
  }, [user, fetchDashboardStats]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardStats().then(() => {
      setIsRefreshing(false);
      toast.success("Məlumatlar yeniləndi");
    }).catch(_err => {
      setIsRefreshing(false);
      toast.error("Məlumatları yeniləmək mümkün olmadı");
    });
  };
  
  const handlePeriodChange = (_period: string) => {
    toast.info("Dövr dəyişdirildi");
    // Add period filtering logic here if needed
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div className="text-sm text-muted-foreground">

        {user?.role === 'regionadmin' && (
          <p>
            Region məktəbləri: <span className="font-medium">{stats.schoolCount}</span> | {' '}
            Aktiv istifadəçilər: <span className="font-medium">{stats.activeUserCount}</span>
          </p>
        )}
        {user?.role === 'sectoradmin' && (
          <p>
            Sektor məktəbləri: <span className="font-medium">{stats.schoolCount}</span> | {' '}
            Tamamlanma faizi: <span className="font-medium">{stats.completionPercentage}%</span>
          </p>
        )}
        {user?.role === 'schooladmin' && (
          <p>
            Gözləyən formlar: <span className="font-medium">{stats.pendingFormCount}</span> | {' '}
            Tamamlanma faizi: <span className="font-medium">{stats.completionPercentage}%</span>
          </p>
        )}
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
  );
};

export default DashboardHeader;