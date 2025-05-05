
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, FileText, PieChart, Table2, Download, Share2, Eye } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Report, ReportType } from '@/types/report';
import { Badge } from '@/components/ui/badge';

interface ReportItemProps {
  report: Report;
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => Promise<void>;
  onShare: (report: Report) => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ report, onPreview, onDownload, onShare }) => {
  const { t } = useLanguage();
  
  // İcon seçimi
  const getIcon = () => {
    const reportType = report.type.toString();
    
    switch (reportType) {
      case ReportType.STATISTICS.toString():
        return <BarChart2 className="h-12 w-12 text-blue-500" />;
      case ReportType.COMPLETION.toString():
        return <PieChart className="h-12 w-12 text-green-500" />;
      case ReportType.COMPARISON.toString():
        return <Table2 className="h-12 w-12 text-purple-500" />;
      case ReportType.COLUMN.toString():
        return <FileText className="h-12 w-12 text-amber-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };
  
  // Status rəngini təyin etmə
  const getStatusBadge = () => {
    const reportType = report.type.toString();
    
    switch (reportType) {
      case ReportType.STATISTICS.toString():
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {t('statistics')}
        </Badge>;
      case ReportType.COMPLETION.toString():
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {t('completion')}
        </Badge>;
      case ReportType.COMPARISON.toString():
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {t('comparison')}
        </Badge>;
      case ReportType.COLUMN.toString():
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {t('column')}
        </Badge>;
      default:
        return <Badge variant="outline">{t('report')}</Badge>;
    }
  };
  
  // Tarixi formatla
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        {getIcon()}
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{report.title}</CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription className="line-clamp-2">
            {report.description || t('noDescription')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>{t('created')}: {formatDate(report.createdAt || report.created_at)}</span>
          <span>{report.author || t('system')}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-4">
        <Button variant="outline" size="sm" onClick={() => onPreview(report)}>
          <Eye className="h-4 w-4 mr-1" />
          {t('preview')}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onShare(report)}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDownload(report)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
