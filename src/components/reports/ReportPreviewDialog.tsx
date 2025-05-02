
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Report, ReportChartProps } from '@/types/report';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ReportPreviewDialogProps {
  reportId: string;
  open: boolean;
  onClose: () => void;
}

// Placeholder komponenti
const ReportChart: React.FC<ReportChartProps> = ({ report }) => {
  return (
    <div className="bg-muted/20 p-4 rounded-md h-64 flex items-center justify-center">
      <p className="text-muted-foreground">
        Qrafik görüntüsü burada olacaq ({report.type})
      </p>
    </div>
  );
};

// Placeholder komponenti
const ReportTable: React.FC<{ report: Report }> = ({ report }) => {
  return (
    <div className="bg-muted/20 p-4 rounded-md h-64 flex items-center justify-center">
      <p className="text-muted-foreground">
        Cədvəl görüntüsü burada olacaq
      </p>
    </div>
  );
};

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  reportId,
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (error) throw error;
      return data as Report;
    },
    enabled: !!reportId && open,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Hesabat tapılmadı</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const reportTitle = report.title;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{reportTitle}</DialogTitle>
          <DialogDescription>
            {report.description || 'Bu hesabat haqqında ətraflı təsvir yoxdur'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Ümumi</TabsTrigger>
            <TabsTrigger value="chart">Qrafik</TabsTrigger>
            <TabsTrigger value="table">Cədvəl</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hesabat haqqında</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hesabat növü</p>
                  <p className="font-medium">{report.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yaradılma tarixi</p>
                  <p className="font-medium">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{report.status}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="chart">
            {report && <ReportChart report={report} />}
          </TabsContent>
          <TabsContent value="table">
            {report && <ReportTable report={report} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
