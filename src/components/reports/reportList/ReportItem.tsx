import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  LineChart,
  PieChart,
  Table,
  LayoutGrid,
  MoreVertical,
  Calendar,
  Edit,
  Share2,
  Trash2,
} from "lucide-react";
import { Report, ReportStatus, REPORT_TYPE_VALUES } from "@/types/core/report";
import { format } from "date-fns";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportItemProps {
  report: Report;
  onSelect?: (report: Report) => void;
  onEdit?: (report: Report) => void;
  onDelete?: (reportId: string) => void;
  onShare?: (report: Report) => void;
}

const ReportItem: React.FC<ReportItemProps> = ({
  report,
  onSelect,
  onEdit,
  onDelete,
  onShare,
}) => {
  const { t } = useTranslation();

  const getReportIcon = () => {
    switch (report.type) {
      case REPORT_TYPE_VALUES.BAR: {
        return <BarChart className="h-5 w-5" />;
      case REPORT_TYPE_VALUES.LINE: {
        return <LineChart className="h-5 w-5" />;
      case REPORT_TYPE_VALUES.PIE: {
        return <PieChart className="h-5 w-5" />;
      case REPORT_TYPE_VALUES.TABLE: {
        return <Table className="h-5 w-5" />;
      case REPORT_TYPE_VALUES.METRICS: {
        return <LayoutGrid className="h-5 w-5" />;
      default:
        return <BarChart className="h-5 w-5" />;
    }
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case ReportStatus.DRAFT: {
        return (
          <Badge variant="outline" className="bg-gray-100">
            {t("draft")}
          </Badge>
        );
      case ReportStatus.PUBLISHED: {
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {t("published")}
          </Badge>
        );
      case ReportStatus.ARCHIVED: {
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            {t("archived")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {getReportIcon()}
            {getStatusBadge()}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">{t("openMenu")}</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(report)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("edit")}
                </DropdownMenuItem>
              )}
              {onShare && (
                <DropdownMenuItem onClick={() => onShare(report)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t("share")}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(report.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3">
        <CardTitle className="text-lg mb-2 line-clamp-1">
          {report.title}
        </CardTitle>

        {report.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {report.description}
          </p>
        )}

        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(report.created_at)}
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect && onSelect(report)}
        >
          {t("view")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
