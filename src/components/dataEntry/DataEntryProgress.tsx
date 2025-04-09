
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useLanguageSafe } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/column';

export interface DataEntryProgressProps {
  total?: number;
  completed?: number;
  percentage: number;
  columns?: CategoryWithColumns['columns'];
  completionPercentage?: number;
}

const DataEntryProgress: React.FC<DataEntryProgressProps> = ({ 
  total = 0, 
  completed = 0, 
  columns, 
  percentage, 
  completionPercentage 
}) => {
  const { t } = useLanguageSafe();
  
  // Əgər percentage dəyəri verilməyibsə və completionPercentage varsa, onu istifadə et
  const displayPercentage = percentage || completionPercentage || 0;
  
  // Əgər tələb olunan sütunlar verilərsə, onları hesabla
  const calculatedTotal = total || (columns?.length || 0);
  const calculatedCompleted = completed || Math.round((calculatedTotal * displayPercentage) / 100);

  return (
    <div className="space-y-2 w-full max-w-xs">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{t('progress')}</span>
        <span>{displayPercentage}%</span>
      </div>
      <Progress value={displayPercentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {t('completedCategories').replace('{completed}', calculatedCompleted.toString()).replace('{total}', calculatedTotal.toString())}
      </p>
    </div>
  );
};

export default DataEntryProgress;
