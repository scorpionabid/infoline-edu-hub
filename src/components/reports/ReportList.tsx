
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import ReportPreviewDialog from './ReportPreviewDialog';
import { Report, ReportType } from '@/types/report';
import CreateReportDialog from './CreateReportDialog';
import ReportFilter from './reportList/ReportFilter';
import ReportEmptyState from './reportList/ReportEmptyState';
import ReportLoading from './reportList/ReportLoading';
import ReportItem from './reportList/ReportItem';

const ReportList: React.FC = () => {
  const { t } = useLanguage();
  const { reports, loading, error, downloadReport } = useReports();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Filtrlənmiş hesabatlar
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  const handlePreview = (report: Report) => {
    setPreviewReport(report);
  };
  
  const closePreview = () => {
    setPreviewReport(null);
  };
  
  const handleDownload = async (report: Report) => {
    const url = await downloadReport(report.id);
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  const handleCreateReport = () => {
    setShowCreateDialog(true);
  };
  
  const closeCreateDialog = () => {
    setShowCreateDialog(false);
  };
  
  return (
    <div className="space-y-4">
      {/* Filtrlər və axtarış */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <ReportFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        
        <Button onClick={handleCreateReport}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createReport')}
        </Button>
      </div>
      
      {/* Hesabat kartları */}
      {loading ? (
        <ReportLoading />
      ) : error ? (
        // Xəta
        <div className="flex justify-center items-center h-40">
          <p className="text-destructive">{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <ReportEmptyState onCreateReport={handleCreateReport} />
      ) : (
        // Hesabatlar siyahısı
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <ReportItem 
              key={report.id}
              report={report}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
      
      {/* Hesabat önizləmə dialoqu */}
      {previewReport && (
        <ReportPreviewDialog
          report={previewReport}
          open={!!previewReport}
          onClose={closePreview}
        />
      )}
      
      {/* Hesabat yaratma dialoqu */}
      <CreateReportDialog open={showCreateDialog} onClose={closeCreateDialog} />
    </div>
  );
};

export default ReportList;
