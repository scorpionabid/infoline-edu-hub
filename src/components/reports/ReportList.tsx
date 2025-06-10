import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ReportCard from './ReportCard';
import ReportEmptyState from './reportList/ReportEmptyState';
import ReportLoading from './reportList/ReportLoading';
import ExportButtons from './ExportButtons';
import { useAdvancedReports } from '@/hooks/reports/useAdvancedReports';
import CreateReportDialog from './CreateReportDialog';
import { Report } from '@/types/report';
import { AdvancedReportData } from '@/types/advanced-report';

export const ReportList: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Real data hook kullanaq
  const { reports: advancedReports, loading: isLoading, error } = useAdvancedReports();

  // Convert AdvancedReportData to Report format for compatibility
  const reports: Report[] = advancedReports.map((advReport): Report => ({
    id: advReport.id,
    title: advReport.title,
    description: advReport.description,
    type: convertAdvancedTypeToReportType(advReport.type),
    status: 'published', // Default status for generated reports
    created_at: advReport.generatedAt,
    updated_at: advReport.generatedAt,
    created_by: advReport.generatedBy,
    content: {
      data: advReport.data,
      filters: advReport.filters,
      metadata: advReport.metadata
    },
    insights: advReport.insights,
    recommendations: advReport.recommendations
  }));

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to convert advanced report type to legacy report type
  function convertAdvancedTypeToReportType(advType: string): any {
    switch (advType) {
      case 'performance': return 'metrics';
      case 'completion': return 'bar';
      case 'comparison': return 'pie';
      case 'trend': return 'line';
      default: return 'table';
    }
  }

  const handleViewReport = (reportId: string) => {
    console.log('Viewing report:', reportId);
    // Burada report görüntüleme logic-i əlavə olunacaq
  };

  if (isLoading) {
    return <ReportLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{t('errorLoadingReports')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>{t('allReports')}</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchReports')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('createReport')}
              </Button>
              <ExportButtons 
                reportType="school-performance"
                className=""
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <ReportEmptyState onCreateReport={() => setIsCreateDialogOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={() => handleViewReport(report.id)}
            />
          ))}
        </div>
      )}

      {/* Create Report Dialog */}
      <CreateReportDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={() => {
          setIsCreateDialogOpen(false);
          // Refresh reports yəni reload logic əlavə et
        }}
      />
    </div>
  );
};

export default ReportList;
