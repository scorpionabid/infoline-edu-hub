
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash, BarChart, PieChart, LineChart, Table as TableIcon } from 'lucide-react';
import { Report, ReportTypeValues } from '@/types/report';

interface ReportItemProps {
  report: Report;
  onView: (reportId: string) => void;
  onEdit?: (report: Report) => void;
  onDelete?: (reportId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ReportItem: React.FC<ReportItemProps> = ({
  report,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'archived':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const ReportIcon = () => {
    // Normalize the report type to uppercase for comparison
    const normalizedType = report.type.toUpperCase() as keyof typeof ReportTypeValues;
    
    switch (normalizedType) {
      case 'BAR':
        return <BarChart className="h-8 w-8 text-primary" />;
      case 'PIE':
        return <PieChart className="h-8 w-8 text-primary" />;
      case 'LINE':
        return <LineChart className="h-8 w-8 text-primary" />;
      case 'TABLE':
        return <TableIcon className="h-8 w-8 text-primary" />;
      default:
        return <BarChart className="h-8 w-8 text-primary" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeLabel = (type: string) => {
    // Normalize the report type to uppercase for comparison
    const normalizedType = type.toUpperCase() as keyof typeof ReportTypeValues;
    
    switch (normalizedType) {
      case 'BAR':
        return 'Bar Chart';
      case 'PIE':
        return 'Pie Chart';
      case 'LINE':
        return 'Line Chart';
      case 'TABLE':
        return 'Table Report';
      default:
        return type;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-2">
            <div className="p-2 rounded-lg bg-muted">
              <ReportIcon />
            </div>
            <div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription className="line-clamp-2">{report.description}</CardDescription>
            </div>
          </div>
          <Badge variant={getBadgeVariant(report.status)}>
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium">{getTypeLabel(report.type)}</span>
          </div>
          <div className="flex justify-between">
            <span>Created:</span>
            <span className="font-medium">{formatDate(report.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated:</span>
            <span className="font-medium">{formatDate(report.updated_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => onView(report.id)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <div className="space-x-2">
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit && onEdit(report)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete && onDelete(report.id)}>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
