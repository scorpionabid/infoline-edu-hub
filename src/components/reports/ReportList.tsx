
import React, { useState } from 'react';
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
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import ReportPreviewDialog from './ReportPreviewDialog';
import { Report, ReportType } from '@/types/report';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import CreateReportDialog from './CreateReportDialog';

const ReportList: React.FC = () => {
  const { t } = useLanguage();
  const { reports, loading, error, downloadReport } = useReports();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
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
  
  // Filtrlənmiş hesabatlar
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  const handlePreview = (report: Report) => {
    setPreviewReport(report);
  };
  
  const closePreview = () => {
    setPreviewReport(null);
  };
  
  const handleDownload = async (report: Report) => {
    const url = await downloadReport(report.id);
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  const handleCreateReport = () => {
    setShowCreateDialog(true);
  };
  
  const closeCreateDialog = () => {
    setShowCreateDialog(false);
  };
  
  // Hesabat növü tərcüməsi
  const getReportTypeTranslation = (type: ReportType): string => {
    switch (type) {
      case 'statistics':
        return t('statistics');
      case 'completion':
        return t('completion');
      case 'comparison':
        return t('comparison');
      case 'column':
        return t('column');
      case 'category':
        return t('category');
      case 'school':
        return t('school');
      case 'region':
        return t('region');
      case 'sector':
        return t('sector');
      case 'custom':
        return t('custom');
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Filtrlər və axtarış */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchReports')}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as ReportType | 'all')}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t('reportType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTypes')}</SelectItem>
              <SelectItem value="statistics">{t('statistics')}</SelectItem>
              <SelectItem value="completion">{t('completion')}</SelectItem>
              <SelectItem value="comparison">{t('comparison')}</SelectItem>
              <SelectItem value="column">{t('column')}</SelectItem>
              <SelectItem value="category">{t('category')}</SelectItem>
              <SelectItem value="school">{t('school')}</SelectItem>
              <SelectItem value="region">{t('region')}</SelectItem>
              <SelectItem value="sector">{t('sector')}</SelectItem>
              <SelectItem value="custom">{t('custom')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleCreateReport}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createReport')}
        </Button>
      </div>
      
      {/* Hesabat kartları */}
      {loading ? (
        // Yüklənmə skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-32 bg-muted" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-10" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        // Xəta
        <div className="flex justify-center items-center h-40">
          <p className="text-destructive">{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        // Məlumat yoxdur
        <div className="flex flex-col justify-center items-center h-60 text-center">
          <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-medium mb-2">{t('noReportsFound')}</p>
          <p className="text-muted-foreground mb-4">{t('createYourFirstReport')}</p>
          <Button onClick={handleCreateReport}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createReport')}
          </Button>
        </div>
      ) : (
        // Hesabatlar siyahısı
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-muted flex items-center justify-center relative overflow-hidden">
                  {getReportIcon(report.type)}
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
                      {getReportTypeTranslation(report.type)}
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
                    {new Date(report.createdAt || report.created || report.dateCreated || '').toLocaleDateString()}
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
                  onClick={() => handleDownload(report)}
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
      )}
      
      {/* Hesabat önizləmə dialoqu */}
      {previewReport && (
        <ReportPreviewDialog
          report={previewReport}
          open={!!previewReport}
          onClose={closePreview}
        />
      )}
      
      {/* Hesabat yaratma dialoqu */}
      <CreateReportDialog open={showCreateDialog} onClose={closeCreateDialog} />
    </div>
  );
};

export default ReportList;
