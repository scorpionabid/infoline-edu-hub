
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CompletionRateCardProps } from '@/types/dashboard';

export const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ completionRate, title }) => {
  // Tamamlanma faizinin rəngini təyin edirik
  const getProgressColor = (rate: number) => {
    if (rate >= 85) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="col-span-2 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{Math.round(completionRate)}%</span>
            <span className="text-sm text-muted-foreground">
              {completionRate < 50
                ? 'Tamamlanma aşağı səviyyədədir'
                : completionRate < 85
                ? 'Tamamlanma orta səviyyədədir'
                : 'Tamamlanma yaxşı vəziyyətdədir'}
            </span>
          </div>
          <Progress 
            value={completionRate} 
            max={100}
            className="h-2"
            indicatorClassName={getProgressColor(completionRate)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
