
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Download, Share2 } from 'lucide-react';

export interface ReportPreviewDialogProps {
  reportId: string; 
  open: boolean;
  onClose: () => void;
}

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({ 
  reportId,
  open, 
  onClose 
}) => {
  // Mock data for demonstration
  const report = {
    id: reportId,
    title: 'Quarterly School Performance Report',
    description: 'This report provides an overview of school performance metrics for Q3 2023.',
    type: 'performance',
    createdAt: '2023-09-15T10:30:00Z',
    updatedAt: '2023-09-15T14:45:00Z',
    status: 'published',
    content: {
      summary: 'Overall positive growth in key metrics compared to previous quarter.',
      charts: [
        { id: 'chart1', type: 'bar', title: 'Attendance Rate by School' },
        { id: 'chart2', type: 'line', title: 'Academic Performance Trends' }
      ],
      tables: [
        { id: 'table1', title: 'Top Performing Schools' },
        { id: 'table2', title: 'Areas Needing Improvement' }
      ]
    },
    insights: [
      'School attendance increased by 5% across all regions',
      'Math scores showed significant improvement in rural areas',
      'Teacher retention rate improved by 12%'
    ],
    recommendations: [
      'Implement new literacy program in underperforming schools',
      'Expand teacher training in STEM subjects',
      'Increase parent involvement through monthly workshops'
    ]
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download report:', report.id);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share report:', report.id);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-4 top-4" 
            onClick={onClose}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="pt-6">
            <DialogTitle className="text-2xl">{report.title}</DialogTitle>
            <DialogDescription className="mt-2">{report.description}</DialogDescription>
            <div className="flex items-center justify-between mt-4">
              <Badge variant={report.status === 'published' ? 'default' : 'outline'}>
                {report.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created: {formatDate(report.createdAt)}
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow mt-6">
          <div className="space-y-6 pr-4">
            {report.insights && Array.isArray(report.insights) && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>Important findings from this report</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc pl-5">
                    {report.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {report.recommendations && Array.isArray(report.recommendations) && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Suggested actions based on findings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc pl-5">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Charts & Visualizations</CardTitle>
                <CardDescription>Data represented graphically</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.content.charts.map(chart => (
                  <div key={chart.id} className="border rounded-lg p-4 flex flex-col items-center justify-center h-[200px]">
                    <p className="font-medium mb-2">{chart.title}</p>
                    <p className="text-muted-foreground text-sm">[{chart.type} chart visualization]</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Tables</CardTitle>
                <CardDescription>Detailed numerical data</CardDescription>
              </CardHeader>
              <CardContent>
                {report.content.tables.map(table => (
                  <div key={table.id} className="mb-6">
                    <h4 className="font-medium mb-2">{table.title}</h4>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">[Table data would appear here]</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <Separator className="my-4" />
        
        <DialogFooter>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
