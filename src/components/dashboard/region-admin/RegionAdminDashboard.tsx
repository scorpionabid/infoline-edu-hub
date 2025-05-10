
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RegionAdminDashboardData, SectorStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import PendingApprovalsCard from '../PendingApprovalsCard';
import SectorStatsTable from './SectorStatsTable';

interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSectors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sectorStats.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('sectorsInRegion')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('completedSectors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.sectorStats.filter(s => (s.completion || 0) >= 100).length}
            </div>
            <Progress 
              value={(data.sectorStats.filter(s => (s.completion || 0) >= 100).length / Math.max(data.sectorStats.length, 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pendingSectors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {data.sectorStats.filter(s => (s.completion || 0) > 0 && (s.completion || 0) < 100).length}
            </div>
            <Progress 
              value={(data.sectorStats.filter(s => (s.completion || 0) > 0 && (s.completion || 0) < 100).length / Math.max(data.sectorStats.length, 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('notStartedSectors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {data.sectorStats.filter(s => (s.completion || 0) === 0).length}
            </div>
            <Progress 
              value={(data.sectorStats.filter(s => (s.completion || 0) === 0).length / Math.max(data.sectorStats.length, 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('sectors')}</CardTitle>
            <CardDescription>{t('sectorsInRegionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SectorStatsTable sectors={data.sectorStats} />
          </CardContent>
        </Card>
        
        <PendingApprovalsCard items={data.pendingApprovals} />
      </div>
    </div>
  );
};

export default RegionAdminDashboard;
