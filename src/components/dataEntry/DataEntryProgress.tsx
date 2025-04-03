
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';

export interface DataEntryProgressProps {
  total: number;
  completed: number;
  percentage: number;
}

const DataEntryProgress: React.FC<DataEntryProgressProps> = ({ total, completed, percentage }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 w-full max-w-xs">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{t('progress')}</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {t('completedCategories').replace('{completed}', completed.toString()).replace('{total}', total.toString())}
      </p>
    </div>
  );
};

export default DataEntryProgress;
