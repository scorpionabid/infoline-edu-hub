
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface CompletionRateCardProps {
  completionRate: number;
  title: string;
}

export const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ 
  completionRate, 
  title 
}) => {
  const formattedRate = completionRate ? Math.round(completionRate) : 0;
  
  // Progress bar rənglərini tamamlanma dərəcəsinə görə təyin et
  const getColorClass = () => {
    if (formattedRate > 75) return "bg-green-500";
    if (formattedRate > 50) return "bg-blue-500";
    if (formattedRate > 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tamamlanma</span>
          <span className="font-semibold">{formattedRate}%</span>
        </div>
        <Progress value={formattedRate} className="h-2" indicatorClassName={getColorClass()} />
      </CardContent>
    </Card>
  );
};
