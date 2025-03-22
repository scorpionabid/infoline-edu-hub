
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share2 } from 'lucide-react';
import { Report } from '@/types/report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportChart from './ReportChart';

interface ReportPreviewDialogProps {
  report: Report;
  open: boolean;
  onClose: () => void;
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  report,
  open,
  onClose,
}) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>{report.description}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">{t('chart')}</TabsTrigger>
            <TabsTrigger value="data">{t('data')}</TabsTrigger>
            <TabsTrigger value="summary">{t('summary')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="pt-4">
            <div className="h-96 w-full">
              <ReportChart reportType={report.type} data={report.data} />
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="pt-4">
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">{t('name')}</th>
                    <th className="p-2 text-left">{t('value')}</th>
                    <th className="p-2 text-left">{t('category')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.value}</td>
                      <td className="p-2">{item.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="pt-4">
            <div className="prose dark:prose-invert max-w-none">
              <p>{report.summary}</p>
              
              {report.insights && (
                <>
                  <h4>{t('keyInsights')}</h4>
                  <ul>
                    {report.insights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {report.recommendations && (
                <>
                  <h4>{t('recommendations')}</h4>
                  <ul>
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            {t('print')}
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            {t('share')}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t('download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
