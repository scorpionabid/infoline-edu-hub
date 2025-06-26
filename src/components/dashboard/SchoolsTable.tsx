
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SchoolStat } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";

interface SchoolsTableProps {
  schools: SchoolStat[];
  onViewSchool?: (id: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({
  schools,
  onViewSchool,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewSchool = (id: string) => {
    if (onViewSchool) {
      onViewSchool(id);
    } else {
      navigate(`/schools/${id}`);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("school")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("completion")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-muted-foreground"
              >
                {t("noSchools")}
              </TableCell>
            </TableRow>
          ) : (
            schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{getStatusBadge(school.status)}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{school.completionRate}%</span>
                    </div>
                    <Progress value={school.completionRate} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewSchool(school.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t("view")}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolsTable;
