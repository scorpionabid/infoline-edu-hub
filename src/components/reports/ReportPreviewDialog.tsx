
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Report } from '@/types/report';
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';

interface ReportPreviewDialogProps {
  report: Report | null;
  open: boolean;
  onClose: () => void;
}

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  report,
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('chart');

  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>{report.description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mt-4 mb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <TabsContent value="chart" className="mt-2">
          <div className="bg-muted/20 border rounded-md p-8 flex items-center justify-center h-[400px]">
            Chart visualization will be displayed here
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-2">
          <div className="bg-muted/20 border rounded-md p-8 flex items-center justify-center h-[400px]">
            Table data will be displayed here
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-2">
          <div className="space-y-4">
            <div className="bg-muted/20 border rounded-md p-4">
              <h3 className="font-medium mb-2">Key Insights</h3>
              <ul className="list-disc pl-5 space-y-1">
                {report.insights?.length ? (
                  report.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))
                ) : (
                  <li>No insights available for this report</li>
                )}
              </ul>
            </div>

            <div className="bg-muted/20 border rounded-md p-4">
              <h3 className="font-medium mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {report.recommendations?.length ? (
                  report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))
                ) : (
                  <li>No recommendations available for this report</li>
                )}
              </ul>
            </div>
          </div>
        </TabsContent>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
