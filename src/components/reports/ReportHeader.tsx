
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Filter } from 'lucide-react';
import CreateReportDialog from './CreateReportDialog';
import { Report, ReportHeaderProps } from '@/types/report';

export const ReportHeader: React.FC<ReportHeaderProps> = ({ onCreateReport }) => {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreate = async (data: { title: string; description: string; type: string }) => {
    try {
      await onCreateReport(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">{t('reports')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('reportsDescription')}
        </p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {t('filter')}
        </Button>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newReport')}
        </Button>
      </div>

      <CreateReportDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ReportHeader;
