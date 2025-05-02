
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CompletionRateCardProps } from '@/types/dashboard';

export const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ title, completionRate }) => {
  // Tamamlama faizi rəngini təyin edirik
  const getCompletionColor = (rate: number) => {
    if (rate < 25) return 'bg-red-500';
    if (rate < 50) return 'bg-orange-500';
    if (rate < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Tamamlanma</span>
            <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
          </div>
          <Progress
            value={completionRate}
            className="h-2"
            indicatorClassName={getCompletionColor(completionRate)}
          />
          <div className="pt-2 text-sm text-muted-foreground">
            {completionRate < 100
              ? `${100 - Math.round(completionRate)}% tamamlanması lazımdır`
              : 'Bütün məlumatlar tamamlanıb'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
