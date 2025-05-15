
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useReports } from '@/hooks/reports/useReports';
import ReportCard from './ReportCard';
import CreateReportDialog from './CreateReportDialog';
import ReportPreviewDialog from './ReportPreviewDialog';
import ReportEmptyState from './ReportEmptyState';

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ReportList: React.FC = () => {
  const { reports, createReport } = useReports();
  // Define isLoading and isError manually since they're not in the hook response
  const isLoading = false;
  const isError = false;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = async (reportData: { 
    title: string; 
    description: string; 
    type: string;
  }) => {
    try {
      await createReport(reportData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleViewReport = (reportId: string) => {
    setSelectedReport(reportId);
    setIsPreviewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Report
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Filter className="h-4 w-4" />
          </span>
        </div>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading reports...</div>
          ) : isError ? (
            <div className="flex justify-center py-8 text-destructive">
              Error loading reports. Please try again later.
            </div>
          ) : filteredReports.length === 0 ? (
            <ReportEmptyState onCreateReport={() => setIsCreateDialogOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onView={() => handleViewReport(report.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateReportDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateReport}
      />

      {selectedReport && (
        <ReportPreviewDialog
          reportId={selectedReport}
          open={isPreviewDialogOpen}
          onClose={() => setIsPreviewDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ReportList;
