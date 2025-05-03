import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface DataEntryProgressProps {
  percentage: number;
}

const DataEntryProgress: React.FC<DataEntryProgressProps> = ({ percentage }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center justify-between text-sm font-medium">
          <div>{t('completion')}</div>
          <div>{percentage}%</div>
        </div>
        <Progress value={percentage} />
      </div>
    </Card>
  );
};

export default DataEntryProgress;
