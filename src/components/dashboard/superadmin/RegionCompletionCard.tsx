
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RegionStat } from '@/types/dashboard';

interface RegionCompletionCardProps {
  regions: RegionStat[];
}

const RegionCompletionCard: React.FC<RegionCompletionCardProps> = ({ regions }) => {
  // Sort regions by completion rate in descending order
  const sortedRegions = [...regions].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Region Tamamlanma</CardTitle>
        <CardDescription>
          Regionlar üzrə tamamlanma dərəcəsi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRegions.map((region) => (
            <div key={region.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{region.name}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(region.completionRate)}%
                </span>
              </div>
              <Progress value={region.completionRate} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{region.sectorCount} sektor</span>
                <span>{region.schoolCount} məktəb</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionCompletionCard;
