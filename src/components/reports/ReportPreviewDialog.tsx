import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Report, ReportPreviewDialogProps, REPORT_TYPE_VALUES, ReportStatus } from '@/types/core/report';
import { useLanguage } from '@/context/LanguageContext';
import { X } from 'lucide-react';
import ReportChartView from './ReportChartView';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({ 
  report,
  open,
  isOpen,
  onOpenChange,
  onClose
}) => {
  const { t } = useLanguage();
  
  const dialogOpen = open !== undefined ? open : isOpen;
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  if (!report) {
    return null;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'PPP');
    } catch (e) {
      return dateStr;
    }
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case REPORT_TYPE_VALUES.BAR:
        return t('barChart');
      case REPORT_TYPE_VALUES.LINE:
        return t('lineChart');
      case REPORT_TYPE_VALUES.PIE:
        return t('pieChart');
      case REPORT_TYPE_VALUES.TABLE:
        return t('tableReport');
      case REPORT_TYPE_VALUES.METRICS:
        return t('metricsReport');
      case REPORT_TYPE_VALUES.CUSTOM:
        return t('customReport');
      default:
        return type;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100">{t('draft')}</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-100 text-green-800">{t('published')}</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">{t('archived')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-start">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              {report.title}
              {getStatusBadge(report.status)}
            </DialogTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {getReportTypeName(report.type)} • {formatDate(report.created_at)}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {report.description && (
          <div className="text-sm text-muted-foreground mb-4">
            {report.description}
          </div>
        )}

        <div className="bg-muted/20 p-4 rounded-md min-h-[400px]">
          <ReportChartView report={report} />
        </div>

        {report.insights && report.insights.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">{t('insights')}</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {report.insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {report.recommendations && report.recommendations.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">{t('recommendations')}</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {report.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
