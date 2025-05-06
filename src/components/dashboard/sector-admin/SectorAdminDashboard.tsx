
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { ActivityLogCard } from '@/components/dashboard/sector-admin/ActivityLogCard';
import { SchoolsList } from '@/components/dashboard/sector-admin/SchoolsList';
import { SchoolsTable } from '@/components/dashboard/sector-admin/SchoolsTable';
import { SectorStatsCard } from '@/components/dashboard/sector-admin/SectorStatsCard';
import { SchoolStat } from '@/types/school';

const SectorAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sectorId, regionId } = usePermissions();
  const [sectorName, setSectorName] = useState<string>("");
  const [schoolStats, setSchoolStats] = useState<SchoolStat[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [totalSchools, setTotalSchools] = useState<number>(0);
  const [activeSchools, setActiveSchools] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setIsLoading(true);
        
        if (sectorId) {
          // Sektor məlumatlarını çək
          const { data: sectorData } = await supabase
            .from('sectors')
            .select('name')
            .eq('id', sectorId)
            .single();
          
          if (sectorData) {
            setSectorName(sectorData.name);
          }

          // Sektora aid məktəbləri çək
          const { data: schoolsData, error: schoolsError } = await supabase
            .from('schools')
            .select('*')
            .eq('sector_id', sectorId)
            .eq('status', 'active');
          
          if (schoolsError) throw schoolsError;
          
          setTotalSchools(schoolsData ? schoolsData.length : 0);
          setActiveSchools(schoolsData ? schoolsData.filter(s => s.status === 'active').length : 0);

          // Təsdiq gözləyən məlumatları çək
          const { count, error: pendingError } = await supabase
            .from('data_entries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
          
          if (pendingError) throw pendingError;
          
          setPendingApprovals(count || 0);

          // Məktəblərin tamamlanma faizini hesabla
          if (schoolsData && schoolsData.length > 0) {
            const schoolIds = schoolsData.map(school => school.id);
            
            // Ayrı-ayrı məktəb statistikasını çək
            const { data: statsData, error: statsError } = await supabase
              .from('schools')
              .select('id, name, status, completion_rate')
              .in('id', schoolIds);
            
            if (statsError) throw statsError;
            
            if (statsData) {
              const schoolStatsList = statsData.map(school => {
                // Bu məktəb üçün təxmini tamamlanma faizi hesabla
                // Əsl məlumatları verilənlər bazasından gətirmək üçün
                // daha mürəkkəb sorğular lazım ola bilər
                const formsCompleted = Math.floor(Math.random() * 10);
                const totalForms = 10; // Bu dəyər dinamik olaraq hesablanmalıdır
                const completionRate = school.completion_rate || Math.floor((formsCompleted / totalForms) * 100);
                
                return {
                  id: school.id,
                  name: school.name,
                  formsCompleted,
                  totalForms,
                  completionRate,
                  status: school.status
                };
              });
              
              setSchoolStats(schoolStatsList);
              
              // Ümumi tamamlanma faizini hesabla
              const totalCompletionRate = schoolStatsList.reduce((acc, school) => acc + school.completionRate, 0);
              setCompletionRate(
                schoolStatsList.length > 0 ? Math.floor(totalCompletionRate / schoolStatsList.length) : 0
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching sector data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectorData();
  }, [sectorId, regionId]);

  // Unique school status values və sayları
  const getSchoolStatusCounts = () => {
    const counts = {
      active: 0,
      inactive: 0,
      total: schoolStats.length
    };
    
    schoolStats.forEach(school => {
      if (school.status === 'active') counts.active++;
      else counts.inactive++;
    });
    
    return counts;
  };
  
  const statusCounts = getSchoolStatusCounts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{sectorName || "Sektor İdarəetmə Paneli"}</h1>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Məktəblər</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              {activeSchools} aktiv, {totalSchools - activeSchools} qeyri-aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanma faizi</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Son 30 gündə +5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Təsdiq gözləyən</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              <button 
                onClick={() => navigate('/approvals')}
                className="text-primary hover:underline flex items-center"
              >
                Təsdiq et <ChevronRight className="h-3 w-3" />
              </button>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlama faizi</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="mt-1 h-2 w-full bg-secondary">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {/* Main content - 5 columns on medium and up */}
        <div className="md:col-span-5 space-y-6">
          {/* Schools list */}
          <Card>
            <CardHeader>
              <CardTitle>Məktəblər</CardTitle>
              <CardDescription>
                Sektora aid bütün məktəblər
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolsTable schools={schoolStats} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={() => navigate('/schools')}>
                Bütün məktəbləri göstər <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Activity Log */}
          <ActivityLogCard />
        </div>
        
        {/* Sidebar - 2 columns on medium and up */}
        <div className="md:col-span-2 space-y-6">
          {/* Sector Stats */}
          <SectorStatsCard 
            totalSchools={statusCounts.total}
            activeSchools={statusCounts.active}
            completionRate={completionRate}
            pendingApprovals={pendingApprovals}
          />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Sürətli əməliyyatlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/schools')}>
                Məktəblər
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/approvals')}>
                Təsdiqlər
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/reports')}>
                Hesabatlar
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/categories')}>
                Kateqoriyalar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
