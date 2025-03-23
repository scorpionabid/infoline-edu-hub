
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface DataEntryProgressProps {
  overallProgress: number;
  completedEntries: number;
  totalCategories: number;
}

const DataEntryProgress: React.FC<DataEntryProgressProps> = ({ 
  overallProgress, 
  completedEntries, 
  totalCategories 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium flex items-center">
          {t('completion')}: 
          <span className={cn(
            "ml-1",
            overallProgress < 50 ? "text-red-500" :
            overallProgress < 80 ? "text-amber-500" :
            "text-green-500"
          )}>
            {Math.round(overallProgress)}%
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          {completedEntries} / {totalCategories} {t('completed')}
        </span>
      </div>
      <Progress 
        value={overallProgress} 
        className="h-2" 
        indicatorClassName={cn(
          overallProgress < 50 ? "bg-red-500" :
          overallProgress < 80 ? "bg-amber-500" :
          "bg-green-500"
        )}
      />
    </div>
  );
};

export default DataEntryProgress;
