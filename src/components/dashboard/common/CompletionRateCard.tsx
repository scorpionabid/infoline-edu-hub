
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface CompletionRateCardProps {
  completionRate: number;
  title: string;
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ 
  completionRate, 
  title 
}) => {
  // Tamamlanma faizinə görə rengi təyin edirik
  const getProgressColor = () => {
    if (completionRate >= 80) return 'bg-green-500';
    if (completionRate >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <CardTitle className="text-md font-medium mb-3">{title}</CardTitle>
        
        <div className="mb-2">
          <span className="text-2xl font-bold">{Math.round(completionRate)}%</span>
          <span className="text-sm text-muted-foreground ml-2">tamamlanıb</span>
        </div>
        
        <div className="w-full">
          <Progress 
            value={completionRate} 
            className="h-2"
            // Rəngi təyin edirik
            indicatorClassName={getProgressColor()}
          />
        </div>
        
        <div className="mt-4 grid grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Aşağı</p>
            <p className="font-medium">0-49%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Orta</p>
            <p className="font-medium">50-79%</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Yüksək</p>
            <p className="font-medium">80-100%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
