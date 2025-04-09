
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { BarChart2, Plus } from 'lucide-react';

interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({ onCreateReport }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col justify-center items-center h-60 text-center">
      <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
      <p className="text-xl font-medium mb-2">{t('noReportsFound')}</p>
      <p className="text-muted-foreground mb-4">{t('createYourFirstReport')}</p>
      <Button onClick={onCreateReport}>
        <Plus className="h-4 w-4 mr-2" />
        {t('createReport')}
      </Button>
    </div>
  );
};

export default ReportEmptyState;
