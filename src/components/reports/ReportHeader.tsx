
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/context/LanguageContext';
import CreateReportDialog from '@/components/reports/CreateReportDialog';
import { useReports } from '@/hooks/useReports';
import { toast } from 'sonner';

export function ReportHeader() {
  const { t } = useLanguage();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { createReport } = useReports();

  const handleCreateReport = async (data: { title: string; description: string; type: string }) => {
    try {
      const result = await createReport({
        title: data.title,
        description: data.description,
        type: data.type as any // Type conversion to match ReportType
      });

      if (result) {
        toast.success(t('reportCreated'));
        return;
      }
    } catch (error) {
      console.error('Hesabat yaradılarkən xəta:', error);
      toast.error(t('reportCreationFailed'));
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <PageHeader 
        title={t('reports')}
        subtitle={t('reportsDescription')}
      />
      
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          {t('importTemplate')}
        </Button>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('createReport')}
        </Button>
      </div>

      {createDialogOpen && (
        <CreateReportDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={handleCreateReport}
        />
      )}
    </div>
  );
}

export default ReportHeader;
