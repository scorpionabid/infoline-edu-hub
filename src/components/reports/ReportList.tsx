import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChartBarIcon, FileText, BarChart3, Share2, Trash, Edit, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Report } from '@/types/report'; // form əvəzinə report istifadə edirik

interface ReportListProps {
  reports: Report[];
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;
  onShare: (report: Report) => void;
  onView: (report: Report) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onEdit, onDelete, onShare, onView }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'published':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'archived':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return t('draft');
      case 'published':
        return t('published');
      case 'archived':
        return t('archived');
      default:
        return t('unknown');
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="bg-white shadow-md rounded-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
            <Badge variant="secondary" className={getStatusColor(report.status)}>
              {getStatusText(report.status)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center mb-1">
                {report.type === 'table' ? (
                  <FileText className="h-4 w-4 mr-2" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {t('type')}: {report.type}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {t('lastUpdated')}: {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => onView(report)}>
                <Eye className="h-4 w-4 mr-2" />
                {t('view')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(report)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onShare(report)}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('share')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(report)}>
                <Trash className="h-4 w-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportList;
