
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, LineChart, Table2, Eye, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Report, ReportType } from '@/types/report';
import { useLanguage } from '@/context/LanguageContext';

interface ReportItemProps {
  report: Report;
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => void;
  onShare: (report: Report) => void;
}

export const ReportItem: React.FC<ReportItemProps> = ({ report, onPreview, onDownload, onShare }) => {
  const { t } = useLanguage();
  
  const getReportIcon = () => {
    const reportType = typeof report.type === 'string' ? report.type : report.type.toString();
    
    if (reportType === ReportType.STATISTICS || reportType === 'statistics') {
      return <BarChart3 className="h-5 w-5 text-primary" />;
    }
    else if (reportType === ReportType.COMPLETION || reportType === 'completion') {
      return <PieChart className="h-5 w-5 text-primary" />;
    }
    else if (reportType === ReportType.COMPARISON || reportType === 'comparison') {
      return <LineChart className="h-5 w-5 text-primary" />;
    }
    else if (reportType === ReportType.COLUMN || reportType === 'column') {
      return <Table2 className="h-5 w-5 text-primary" />;
    }
    return <BarChart3 className="h-5 w-5 text-primary" />;
  };
  
  const getReportTypeBadge = () => {
    const reportType = typeof report.type === 'string' ? report.type : report.type.toString();
    
    if (reportType === ReportType.STATISTICS || reportType === 'statistics') {
      return <Badge variant="outline">Statistika</Badge>;
    }
    else if (reportType === ReportType.COMPLETION || reportType === 'completion') {
      return <Badge variant="outline">Tamamlanma</Badge>;
    }
    else if (reportType === ReportType.COMPARISON || reportType === 'comparison') {
      return <Badge variant="outline">Müqayisə</Badge>;
    }
    else if (reportType === ReportType.COLUMN || reportType === 'column') {
      return <Badge variant="outline">Sütun</Badge>;
    }
    return <Badge variant="outline">Hesabat</Badge>;
  };
  
  const formattedDate = report.created_at || report.createdAt 
    ? format(new Date(report.created_at || report.createdAt || ''), 'dd.MM.yyyy')
    : '';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getReportIcon()}
            <CardTitle className="text-lg">{report.title}</CardTitle>
          </div>
          {getReportTypeBadge()}
        </div>
        <CardDescription className="line-clamp-2">
          {report.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('createdAt')}:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('author')}:</span>
            <span className="font-medium">{report.author || report.createdBy || report.created_by || t('system')}</span>
          </div>
          
          {(report.last_updated || report.updatedAt || report.updated_at) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('lastUpdated')}:</span>
              <span className="font-medium">
                {format(new Date(report.last_updated || report.updatedAt || report.updated_at || ''), 'dd.MM.yyyy')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onPreview(report)}>
          <Eye className="h-4 w-4 mr-1" />
          {t('preview')}
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onDownload(report)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onShare(report)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
