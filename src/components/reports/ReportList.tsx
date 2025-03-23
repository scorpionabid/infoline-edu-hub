
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  BarChart2,
  PieChart,
  TrendingUp,
  Calendar,
  Eye,
  Share2,
} from 'lucide-react';
import { useMockReports } from '@/hooks/useMockReports';
import ReportPreviewDialog from './ReportPreviewDialog';
import { Report, ReportType } from '@/types/report';

const ReportList: React.FC = () => {
  const { t } = useLanguage();
  const { reports } = useMockReports();
  const [previewReport, setPreviewReport] = React.useState<Report | null>(null);
  
  // Report type icon mapping
  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case 'statistics':
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      case 'completion':
        return <PieChart className="h-5 w-5 text-green-500" />;
      case 'comparison':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <BarChart2 className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handlePreview = (report: Report) => {
    setPreviewReport(report);
  };
  
  const closePreview = () => {
    setPreviewReport(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-32 bg-muted flex items-center justify-center relative overflow-hidden">
                {getReportIcon(report.type as ReportType)}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      report.type === 'statistics'
                        ? 'default'
                        : report.type === 'completion'
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    {t(report.type)}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{report.title || report.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {report.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(report.createdAt || report.created || '').toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handlePreview(report)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {t('preview')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-1" />
                {t('download')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-auto px-2"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {previewReport && (
        <ReportPreviewDialog
          report={previewReport}
          open={!!previewReport}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default ReportList;
