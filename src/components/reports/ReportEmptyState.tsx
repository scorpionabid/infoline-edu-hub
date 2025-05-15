
import React from 'react';
import { FileBarChart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({ onCreateReport }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileBarChart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No reports found</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1">
        Create your first report to analyze and visualize data from your collections.
      </p>
      <Button onClick={onCreateReport} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        Create New Report
      </Button>
    </div>
  );
};

export default ReportEmptyState;
