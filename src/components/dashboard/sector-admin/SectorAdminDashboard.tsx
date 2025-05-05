import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectorAdminDashboardData, SchoolStats } from '@/types/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { School, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adaptDashboardNotificationToApp, NotificationType } from '@/types/notification';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
}

export function SectorAdminDashboard({ 
  data, 
  isLoading,
  error,
  onRefresh
}: SectorAdminDashboardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Bildirişləri adapter ilə çevirək
  const adaptedNotifications: NotificationType[] = Array.isArray(data?.notifications) 
    ? data.notifications.map((notification) => ({
        ...adaptDashboardNotificationToApp({
          ...notification,
          createdAt: notification.createdAt || new Date().toISOString()
        })
      }))
    : [];

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>;
  }

  // SchoolStats tip xətasını həll edirik
  const schoolStats = data?.schoolStats || { 
    total: 0, 
    active: 0, 
    incomplete: 0 
  };

  // TypeScript-ə köməklik üçün tip dəqiqləşdiririk
  const totalSchools = typeof schoolStats === 'object' && 'total' in schoolStats ? 
    schoolStats.total : 0;
  
  const activeSchools = typeof schoolStats === 'object' && 'active' in schoolStats ? 
    schoolStats.active : 0;
  
  const incompleteSchools = typeof schoolStats === 'object' && 'incomplete' in schoolStats ? 
    schoolStats.incomplete : 0;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('error')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
          <Button onClick={onRefresh} className="mt-4">
            {t('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sektor Admin Dashboard</h2>
      
      <Grid columns={2} className="gap-6">
        <StatsCard
          title="Məktəblər"
          value={data.stats?.schools || 0}
          icon="M"
          description="Toplam məktəb sayı"
          trend={`${schoolStatsData.active || 0} aktiv məktəb`}
          trendDirection="up"
        />
        <StatsCard
          title="Tamamlanmamış Məktəblər"
          value={schoolStatsData.incomplete || 0}
          icon="I"
          description="Məlumatları tamamlanmayan məktəblər"
          trend={`${Math.round((schoolStatsData.incomplete || 0) / (schoolStatsData.total || 1) * 100)}% sektorda`}
          trendDirection="down"
        />
      </Grid>

      <Grid columns={2} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Ümumi Tamamlanma"
        />
                
        <NotificationsCard
          title="Bildirişlər"
          notifications={adaptedNotifications}
        />
      </Grid>
    </div>
  );
}

export default SectorAdminDashboard;
