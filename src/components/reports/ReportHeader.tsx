
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CreateReportDialog } from './CreateReportDialog';
import { useReports } from '@/hooks/reports/useReports';
import { ReportTypeValues } from '@/types/report';

interface ReportHeaderProps {
  onCategorySelect: (categoryId: string) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ onCategorySelect }) => {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { createReport } = useReports();

  const handleCreateReport = async (data: { title: string; description: string; type: string }) => {
    try {
      await createReport({
        title: data.title,
        description: data.description,
        type: data.type as any
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{t('reports')}</h1>
      
      <div className="flex gap-2">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('createReport')}
        </Button>
      </div>
      
      <CreateReportDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateReport}
      />
    </div>
  );
};

export default ReportHeader;
