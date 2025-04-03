
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

export interface CompletionRateCardProps {
  completion: number;
  title?: string;
  subtitle?: string;
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ completion, title, subtitle }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title || t('completionRate')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold">{completion}%</div>
          <Progress className="h-2" value={completion} />
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
