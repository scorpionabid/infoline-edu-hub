
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ReportEmptyStateProps } from '@/types/core/report';

const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({ onCreateReport }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {t('noReportsYet')}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-lg">
        {t('reportEmptyStateDescription')}
      </p>
      <Button onClick={onCreateReport}>
        <PlusCircle className="h-4 w-4 mr-2" />
        {t('createFirstReport')}
      </Button>
    </div>
  );
};

export default ReportEmptyState;
