
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Report, ReportTypeValues } from '@/types/report';
import { Eye, BarChart, PieChart, LineChart, Table as TableIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ReportItemProps {
  report: Report;
  onView: () => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ report, onView }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getReportTypeIcon = () => {
    switch (report.type) {
      case "BAR":
        return <BarChart size={36} className="text-primary/50" />;
      case "PIE":
        return <PieChart size={36} className="text-primary/50" />;
      case "LINE":
        return <LineChart size={36} className="text-primary/50" />;
      case "TABLE":
        return <TableIcon size={36} className="text-primary/50" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (report.status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-amber-100 text-amber-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative p-6 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{report.title}</h3>
          <div className="flex gap-1">
            <Badge variant="outline" className={getStatusBadgeVariant()}>
              {report.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {report.description || "No description provided"}
        </p>
        <div className="text-xs text-muted-foreground mt-3">
          Created: {formatDate(report.created_at)}
        </div>
      </div>

      <CardContent className="flex items-center justify-center py-4 border-t border-b">
        {getReportTypeIcon()}
      </CardContent>
      
      <CardFooter className="p-4">
        <Button onClick={onView} className="w-full" variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          View Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
