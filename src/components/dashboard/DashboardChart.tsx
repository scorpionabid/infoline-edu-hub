
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardFormStats } from '@/types/dashboard';

interface DashboardChartProps {
  completion: number;
  stats?: DashboardFormStats;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ completion, stats }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tamamlanma</span>
          <span className="text-sm font-medium">{Math.round(completion)}%</span>
        </div>
        <Progress value={completion} className="h-2" />
      </div>
      
      {stats && (
        <div className="grid grid-cols-3 gap-2 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Təsdiqlənən</span>
            <span className="text-lg font-medium">{stats.approvedForms || stats.approved || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Gözləyən</span>
            <span className="text-lg font-medium">{stats.pendingForms || stats.pending || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">İmtina</span>
            <span className="text-lg font-medium">{stats.rejectedForms || stats.rejected || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardChart;
