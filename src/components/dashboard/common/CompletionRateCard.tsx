
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CompletionRateCardProps } from '@/types/dashboard';

export const CompletionRateCard: React.FC<CompletionRateCardProps> = ({
  title,
  completionRate,
  description
}) => {
  // Tamamlanma faizi üçün rəng təyin edirik
  const getProgressColor = (rate: number) => {
    if (rate < 30) return 'bg-red-500';
    if (rate < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{completionRate}%</div>
        <Progress 
          value={completionRate} 
          max={100} 
          className="mt-2 h-2"
          indicatorClassName={getProgressColor(completionRate)}
        />
        {description && (
          <div className="mt-2 text-xs text-muted-foreground">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};
