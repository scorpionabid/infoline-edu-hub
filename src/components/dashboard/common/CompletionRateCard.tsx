import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';

interface CompletionRateCardProps {
  completionRate: number;
  description?: string;
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ 
  completionRate,
  description
}) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('completionRate')}</CardTitle>
        <CardDescription>{description || 'Overall data submission rate'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{completionRate}%</span>
            <Badge variant={completionRate > 75 ? "success" : completionRate > 50 ? "warning" : "destructive"}>
              {completionRate > 75 ? "Good" : completionRate > 50 ? "Average" : "Needs Attention"}
            </Badge>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Completed: {completionRate}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted"></div>
              <span>Remaining: {100 - completionRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
