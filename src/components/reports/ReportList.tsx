
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReports } from '@/hooks/reports/useReports';
import { Report } from '@/types/report';
import { CreateReportDialog } from './CreateReportDialog';
import { ReportPreviewDialog } from './ReportPreviewDialog';

interface ReportItemProps {
  report: Report;
  onSelect: (reportId: string) => void;
}

interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ report, onSelect }) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect(report.id)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{report.title}</CardTitle>
        <CardDescription>{report.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>{new Date(report.created_at || Date.now()).toLocaleDateString()}</div>
          <div className="capitalize">{report.type}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({ onCreateReport }) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>No Reports Found</CardTitle>
        <CardDescription>Create your first report to get started</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button onClick={onCreateReport}>Create Report</Button>
      </CardContent>
    </Card>
  );
};

export const ReportList: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Mock reports data
  const { reports, createReport } = useReports();
  
  // Add mock loading and error states until properly implemented
  const isLoading = false;
  const isError = false;
  
  const handleCreateReport = async (reportData: { title: string; description: string; type: string }) => {
    try {
      await createReport(reportData);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };
  
  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setPreviewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        <h3 className="font-bold">Error loading reports</h3>
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>Create Report</Button>
      </div>

      {reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportItem 
              key={report.id} 
              report={report} 
              onSelect={handleSelectReport} 
            />
          ))}
        </div>
      ) : (
        <ReportEmptyState onCreateReport={() => setCreateDialogOpen(true)} />
      )}

      <CreateReportDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateReport}
      />

      {selectedReportId && (
        <ReportPreviewDialog 
          report={reports.find(r => r.id === selectedReportId) || null}
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ReportList;
