import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, School, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { DashboardStats } from '@/types/dashboard';

interface DashboardHeaderProps {
  onStatsChange?: (stats: DashboardStats) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onStatsChange }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    schoolCount: 0,
    activeUserCount: 0,
    completionPercentage: 0,
    pendingFormCount: 0,
    totalEntries: 0,
    completedEntries: 0,
    pendingEntries: 0,
    approvedEntries: 0,
    rejectedEntries: 0,
    completed: 0,
    pending: 0
  });

  const { data, isError, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { count: schoolCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });

      const { count: activeUserCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalForms, error: formsError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const { count: pendingFormCount, error: pendingError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (schoolsError || usersError || formsError || pendingError) {
        console.error('Error fetching dashboard stats:', schoolsError, usersError, formsError, pendingError);
        throw new Error('Failed to fetch dashboard stats');
      }

      const schoolsTotal = schoolCount || 0;
      const usersTotal = activeUserCount || 0;
      const formsTotal = totalForms || 0;
      const pendingTotal = pendingFormCount || 0;
      const completionPercentage = formsTotal > 0 ? Math.round(((formsTotal - pendingTotal) / formsTotal) * 100) : 0;

      return {
        schoolCount: schoolsTotal,
        activeUserCount: usersTotal,
        completionPercentage,
        pendingFormCount: pendingTotal,
        totalEntries: formsTotal,
        completedEntries: formsTotal - pendingTotal,
        pendingEntries: pendingTotal,
        approvedEntries: formsTotal - pendingTotal,
        rejectedEntries: 0,
        completed: formsTotal - pendingTotal,
        pending: pendingTotal
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data) {
      const newStats: DashboardStats = {
        schoolCount: data.schoolCount || 0,
        activeUserCount: data.activeUserCount || 0,
        completionPercentage: data.completionPercentage || 0,
        pendingFormCount: data.pendingFormCount || 0,
        totalEntries: data.totalEntries || 0,
        completedEntries: data.completedEntries || 0,
        pendingEntries: data.pendingEntries || 0,
        approvedEntries: data.approvedEntries || 0,
        rejectedEntries: data.rejectedEntries || 0,
        completed: data.completed || 0,
        pending: data.pending || 0
      };
      setStats(newStats);
      onStatsChange?.(newStats);
    }
  }, [data, onStatsChange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('dashboard.welcome')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            {t('dashboard.refresh')}
          </Button>
          <Button>
            {t('dashboard.addNew')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalSchools')}
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schoolCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.overview')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.activeUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUserCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.completionRate')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.totalForms')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.pendingApprovals')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFormCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.pending')}
            </p>
          </CardContent>
        </Card>
      </div>

      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{t('dashboard.errorOccurred')}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHeader;
