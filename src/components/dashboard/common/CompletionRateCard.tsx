
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface CompletionRateCardProps {
  value: number;
  className?: string;
}

const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ value, className }) => {
  const { t } = useLanguage();
  
  // Tamamlanma dərəcəsinə görə rəng təyini
  const getColor = () => {
    if (value >= 75) return 'text-green-500';
    if (value >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Progress bar rəngi
  const getProgressBarColor = () => {
    if (value >= 75) return 'bg-green-500';
    if (value >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // İkonanı və rəngini təyin et
  const getStatusIcon = () => {
    if (value >= 75) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
    }
    if (value >= 50) {
      return (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{t('completionRate')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className={cn("text-3xl font-bold", getColor())}>{value}%</span>
            {getStatusIcon()}
          </div>
          
          <div className="w-full bg-muted rounded-full h-2.5 mb-2">
            <div 
              className={cn("h-2.5 rounded-full", getProgressBarColor())} 
              style={{ width: `${value}%` }}
            ></div>
          </div>
          
          <span className="text-sm text-muted-foreground">
            {value < 50 && t('needsAttention')}
            {value >= 50 && value < 75 && t('makingProgress')}
            {value >= 75 && t('goodProgress')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionRateCard;
