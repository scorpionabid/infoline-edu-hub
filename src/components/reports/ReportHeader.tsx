
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { BarChart2, Plus } from 'lucide-react';

const ReportHeader: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <PageHeader 
      title={t('reportTitle')}
      description={t('reportDescription')}
      children={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('createReport')}
        </Button>
      }
    />
  );
};

export default ReportHeader;
