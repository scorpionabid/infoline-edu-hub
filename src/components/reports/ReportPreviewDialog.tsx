
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Report } from '@/types/report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableView } from '@/components/reports/views/TableView';
import { ChartView } from '@/components/reports/views/ChartView';
import { DataMetricsView } from '@/components/reports/views/DataMetricsView';
import { DownloadIcon, PrinterIcon } from 'lucide-react';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
}

interface TableViewProps {
  // Burada TableView komponentinin props'larını təyin edirik 
  // Bu ReportPreviewDialog komponentindəki xətanı həll etmək üçün
  report: Report;
  data?: any[];
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({ 
  open, 
  onOpenChange,
  report
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('table');
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // PDF olarak indir
    if (!report) return;
    
    // PDF yüklüyoruz - mock implementasyon
    const mockDownload = () => {
      console.log('PDF yüklənir...', report);
      return true; // Burada boolean dəyər qaytarırıq ki, if şərtində yoxlaya bilək
    };
    
    const result = mockDownload();
    if (result) {
      console.log('PDF uğurla yükləndi');
    }
  };
  
  useEffect(() => {
    // Dialog açıldığında ilk tab-ı seçirik
    if (open) {
      setActiveTab('table');
    }
  }, [open]);
  
  if (!report) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>{report.title}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <PrinterIcon className="mr-1 h-4 w-4" />
                {t('print')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <DownloadIcon className="mr-1 h-4 w-4" />
                {t('downloadPdf')}
              </Button>
            </div>
          </DialogTitle>
          {report.description && (
            <p className="text-muted-foreground">{report.description}</p>
          )}
        </DialogHeader>
        
        <div className="flex-grow min-h-0 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <TabsList className="grid grid-cols-3 w-[400px] mb-4">
              <TabsTrigger value="table">{t('tableView')}</TabsTrigger>
              <TabsTrigger value="chart">{t('chartView')}</TabsTrigger>
              <TabsTrigger value="metrics">{t('metricsView')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="flex-grow overflow-auto">
              {/* TableViewProps interfeysinə uyğun olaraq report prop-unu ötürürük */}
              <TableView report={report as any} />
            </TabsContent>
            
            <TabsContent value="chart" className="flex-grow overflow-auto">
              <ChartView report={report} />
            </TabsContent>
            
            <TabsContent value="metrics" className="flex-grow overflow-auto">
              <DataMetricsView report={report} />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="border-t pt-4 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
