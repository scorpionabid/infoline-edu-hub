
import React, { useState } from 'react';
import { useReports } from '@/hooks/reports/useReports';
import ReportItem from '@/components/reports/reportList/ReportItem';
import ReportFilter from '@/components/reports/reportList/ReportFilter';
import ReportEmptyState from '@/components/reports/reportList/ReportEmptyState';
import ReportLoading from '@/components/reports/reportList/ReportLoading';
import { ReportPreviewDialog } from '@/components/reports/ReportPreviewDialog';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Grid } from '@/components/ui/grid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateReportDialog } from '@/components/reports/CreateReportDialog';
import { ReportTypeValues } from '@/types/report';

const ReportList: React.FC = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all'
  });
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: reports, isLoading, isError, createReport, deleteReport, archiveReport } = useReports();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateReport = async (data: { title: string, description: string, type: string }) => {
    try {
      await createReport({
        title: data.title,
        description: data.description,
        type: data.type as any,
        status: 'draft'
      });
      
      toast.success(t('reportCreated'));
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error(t('reportCreationFailed'));
    }
  };

  const filteredReports = React.useMemo(() => {
    if (!reports) return [];
    
    return reports.filter(report => {
      const matchesSearch = filters.search 
        ? (report.title || report.name || '').toLowerCase().includes(filters.search.toLowerCase()) || 
          (report.description || '').toLowerCase().includes(filters.search.toLowerCase())
        : true;
      
      const matchesType = filters.type === 'all' ? true : report.type === filters.type;
      const matchesStatus = filters.status === 'all' ? true : report.status === filters.status;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, filters]);

  if (isLoading) return <ReportLoading />;
  
  if (isError) return <div className="text-center py-8">{t('failedToLoadReports')}</div>;
  
  if (filteredReports.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('reports')}</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('createReport')}
          </Button>
        </div>
        
        <ReportFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <ReportEmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
        
        <CreateReportDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreateReport}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('reports')}</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('createReport')}
        </Button>
      </div>
      
      <ReportFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => (
          <ReportItem
            key={report.id}
            report={report}
            onView={(id) => setPreviewReport(id)}
            onEdit={(id) => console.log('Edit report', id)}
            onDelete={deleteReport}
            onDownload={(id) => console.log('Download report', id)}
            onShare={(id) => console.log('Share report', id)}
            onArchive={archiveReport}
          />
        ))}
      </Grid>
      
      {previewReport && (
        <ReportPreviewDialog
          reportId={previewReport}
          open={!!previewReport}
          onClose={() => setPreviewReport(null)}
        />
      )}
      
      <CreateReportDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateReport}
      />
    </div>
  );
};

export default ReportList;
