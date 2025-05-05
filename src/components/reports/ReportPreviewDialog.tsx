
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Report } from '@/types/report';
import { useToast } from '@/hooks/use-toast';
import { useReports } from '@/hooks/reports';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ReportChart from './ReportChart';
import TableView from './TableView';
import { Share2 } from 'lucide-react';

interface ReportPreviewDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle?: string;
  reportDescription?: string;
}

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  isOpen = false,
  open = false,
  onClose,
  reportId,
  reportTitle,
  reportDescription
}) => {
  // Dialog'un görünürlüyünü kombinə et
  const isDialogOpen = isOpen || open;
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getReportById } = useReports();
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("chart");
  
  useEffect(() => {
    const fetchReport = async () => {
      if (reportId && isDialogOpen) {
        setLoading(true);
        try {
          const result = await getReportById(reportId);
          if (result) {
            setReport(result);
          } else {
            toast({
              title: t("errorLoadingReport"),
              description: t("reportNotFound"),
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: t("errorLoadingReport"),
            description: (error as Error).message || t("unknownError"),
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchReport();
  }, [reportId, isDialogOpen, getReportById, toast, t]);
  
  const handleShare = async () => {
    toast({
      title: t("reportShared"),
      description: t("reportShareLink"),
    });
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {loading ? (
              <Skeleton className="h-8 w-60" />
            ) : (
              reportTitle || report?.title || t("reportDetails")
            )}
          </DialogTitle>
          {!loading && (report?.createdAt || report?.created_at) && (
            <p className="text-sm text-muted-foreground">
              {t("createdOn")} {format(new Date(report.createdAt || report.created_at), 'PPP')}
            </p>
          )}
        </DialogHeader>
        
        <div className="w-full">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <Tabs
                defaultValue="chart"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="chart">{t("chart")}</TabsTrigger>
                    <TabsTrigger value="table">{t("table")}</TabsTrigger>
                  </TabsList>
                  
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("share")}
                  </Button>
                </div>
                
                <TabsContent value="chart" className={cn("pt-2", activeTab !== "chart" && "hidden")}>
                  {report && <ReportChart report={report} />}
                </TabsContent>
                
                <TabsContent value="table" className={cn("pt-2", activeTab !== "table" && "hidden")}>
                  {report && <TableView report={report} />}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium">{t("description")}</h3>
                <p className="text-muted-foreground">
                  {reportDescription || report?.description || t("noDescriptionProvided")}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
