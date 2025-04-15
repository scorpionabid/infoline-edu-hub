
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';

interface CompletionRateCardProps {
  value: number;
  className?: string;
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ value, className }) => {
  const { t } = useLanguage();

  // Determine color based on value
  const getColorClass = () => {
    if (value < 30) return 'text-red-500';
    if (value < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('completionRate')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`text-5xl font-bold ${getColorClass()}`}>
            {value}%
          </div>
          <Progress value={value} className="w-full h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {value < 30 && t('lowCompletionMessage')}
            {value >= 30 && value < 70 && t('mediumCompletionMessage')}
            {value >= 70 && t('highCompletionMessage')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
