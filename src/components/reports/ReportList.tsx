
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Report } from '@/types/form';

// Mock data
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Region Statistics',
    description: 'Overall statistics about regions',
    type: 'statistics' as any,
    content: {},
    created_at: new Date().toISOString(),
    status: 'published',
    name: 'Region Statistics Report',
    summary: 'Overview of region statistics and performance metrics'
  },
  {
    id: '2',
    title: 'School Completion Rate',
    description: 'Completion rates for schools',
    type: 'completion' as any,
    content: {},
    created_at: new Date().toISOString(),
    status: 'published',
    name: 'School Completion Report',
    summary: 'Analysis of school data completion rates'
  }
];

const ReportList: React.FC = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setIsPreviewDialogOpen(true);
  };

  const handleDownloadReport = async (report: Report) => {
    // Simulate download
    console.log('Downloading report:', report);
  };

  const handleShareReport = (report: Report) => {
    // Simulate share functionality
    console.log('Sharing report:', report);
  };

  const filteredReports = activeTab === 'all' 
    ? reports 
    : reports.filter(report => {
      if (activeTab === 'templates') return report.is_template;
      return report.type === activeTab;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="statistics">{t('statistics')}</TabsTrigger>
            <TabsTrigger value="completion">{t('completion')}</TabsTrigger>
            <TabsTrigger value="templates">{t('templates')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" /> {t('createReport')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => (
          <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{report.description}</p>
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePreviewReport(report)}
                  >
                    {t('preview')}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadReport(report)}
                  >
                    {t('download')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createNewReport')}</DialogTitle>
            <DialogDescription>
              {t('selectReportType')}
            </DialogDescription>
          </DialogHeader>
          {/* Create report form will go here */}
        </DialogContent>
      </Dialog>

      {/* Preview Report Dialog */}
      {selectedReport && (
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedReport.title}</DialogTitle>
              <DialogDescription>
                {selectedReport.description}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {/* Report preview content will go here */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">Report preview placeholder</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportList;
