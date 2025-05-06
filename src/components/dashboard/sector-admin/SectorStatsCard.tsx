
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SectorStatsCardProps {
  totalSchools: number;
  activeSchools: number;
  completionRate: number;
  pendingApprovals: number;
}

const SectorStatsCard: React.FC<SectorStatsCardProps> = ({ 
  totalSchools, 
  activeSchools, 
  completionRate, 
  pendingApprovals 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Sektor məlumatları</CardTitle>
        <CardDescription>Ümumi statistika</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Məktəblər</span>
          <span className="text-sm font-medium">
            {activeSchools}/{totalSchools}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tamamlanma</span>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">{completionRate}%</span>
            {completionRate > 80 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : completionRate > 50 ? (
              <TrendingUp className="h-4 w-4 text-amber-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        <Progress value={completionRate} className="h-1" />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Təsdiq gözləyən</span>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">{pendingApprovals}</span>
            {pendingApprovals > 0 && (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>

        <div className="text-xs mt-2 text-muted-foreground">
          Son yenilənmə: {new Date().toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorStatsCard;
