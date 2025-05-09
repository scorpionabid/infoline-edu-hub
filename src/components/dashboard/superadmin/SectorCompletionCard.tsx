
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SectorStat } from '@/types/dashboard';

interface SectorCompletionCardProps {
  sectors: SectorStat[];
}

const SectorCompletionCard: React.FC<SectorCompletionCardProps> = ({ sectors }) => {
  // Sort sectors by completion rate in descending order
  const sortedSectors = [...sectors].sort((a, b) => b.completionRate - a.completionRate);
  
  // Show only top 5 sectors
  const topSectors = sortedSectors.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sektor Tamamlanma</CardTitle>
        <CardDescription>
          Top 5 sektor üzrə tamamlanma dərəcəsi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSectors.map((sector) => (
            <div key={sector.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{sector.name}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(sector.completionRate)}%
                </span>
              </div>
              <Progress value={sector.completionRate} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{sector.schoolCount} məktəb</span>
                {sector.pendingApprovals !== undefined && (
                  <span>{sector.pendingApprovals} gözləyən</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorCompletionCard;
