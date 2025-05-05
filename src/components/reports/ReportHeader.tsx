
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/context/LanguageContext';
import CreateReportDialog from '@/components/reports/CreateReportDialog';
import { useReports } from '@/hooks/useReports';
import { toast } from 'sonner';

export function ReportHeader() {
  const { t } = useLanguage();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { addReport } = useReports();

  const handleCreateReport = async (data: { title: string; description: string; type: string }) => {
    try {
      const result = await addReport({
        title: data.title,
        description: data.description,
        type: data.type
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
      
      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {}} 
        >
          <Download size={16} />
          {t('exportAllReports')}
        </Button>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus size={16} />
          {t('newReport')}
        </Button>
      </div>

      <CreateReportDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateReport}
      />
    </div>
  );
}

export default ReportHeader;
