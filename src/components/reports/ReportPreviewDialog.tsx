
import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart2, Table as TableIcon, Activity } from 'lucide-react';
import TableView from '@/components/reports/views/TableView';
import ChartView from '@/components/reports/views/ChartView';
import DataMetricsView from '@/components/reports/views/DataMetricsView';
import { toast } from 'sonner';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData?: Record<string, any>[];
  title?: string;
  columns?: string[];
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  open,
  onOpenChange,
  reportData = [],
  title = "Hesabat Önbaxışı",
  columns = []
}) => {
  const [activeTab, setActiveTab] = useState('table');

  const handleExport = () => {
    toast.success("Hesabat yüklənir...");
    // Excel export işləmini əlavə etmək mümkündür
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-2" />
              Cədvəl
            </TabsTrigger>
            <TabsTrigger value="chart">
              <BarChart2 className="h-4 w-4 mr-2" />
              Qrafik
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Activity className="h-4 w-4 mr-2" />
              Metrikalar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="border rounded-lg mt-2 p-2">
            <TableView data={reportData} columns={columns} />
          </TabsContent>
          
          <TabsContent value="chart" className="border rounded-lg mt-2 p-2">
            <ChartView data={reportData} type="bar" />
          </TabsContent>
          
          <TabsContent value="metrics" className="border rounded-lg mt-2 p-2">
            <DataMetricsView data={reportData} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel-ə ixrac et
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Bağla</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
