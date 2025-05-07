
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchoolStat } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { useLanguageSafe } from "@/context/LanguageContext";
import CompletionProgress from "../CompletionProgress";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface SchoolsTableProps {
  schools: SchoolStat[];
  onViewSchool?: (schoolId: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools,
  onViewSchool 
}) => {
  const { t } = useLanguageSafe();
  const navigate = useNavigate();
  
  const handleViewSchool = (schoolId: string) => {
    if (onViewSchool) {
      onViewSchool(schoolId);
    } else {
      navigate(`/schools/${schoolId}`);
    }
  };
  
  const getStatusColor = (status: string, completionRate: number) => {
    if (status === 'inactive') return 'bg-gray-100 text-gray-800 border-gray-200';
    if (completionRate >= 100) return 'bg-green-100 text-green-800 border-green-200';
    if (completionRate >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };
  
  const getStatusLabel = (status: string, completionRate: number) => {
    if (status === 'inactive') return t('inactive');
    if (completionRate >= 100) return t('completed');
    if (completionRate > 0) return t('inProgress');
    return t('notStarted');
  };

  // Əgər məktəblər yoxdursa
  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noSchoolsFound')}
      </div>
    );
  }
  
  // Tablonun cari tarixi əlavə edək və məktəbləri ən son yeniləmə tarixinə görə sıralayaq
  const currentDate = new Date().toISOString();
  
  // Əgər lastUpdate xassəsi yoxdursa, əlavə edək
  const schoolsWithLastUpdate = schools.map(school => ({
    ...school,
    lastUpdate: school.lastUpdate || currentDate,
    pendingForms: school.pendingForms || 0
  }));
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('school')}</TableHead>
            <TableHead>{t('completionRate')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('pendingForms')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schoolsWithLastUpdate.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">
                {school.name}
              </TableCell>
              <TableCell>
                <div className="w-40">
                  <CompletionProgress 
                    percentage={school.completionRate || 0} 
                    size="sm" 
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(school.status, school.completionRate)}`}>
                  {getStatusLabel(school.status, school.completionRate)}
                </Badge>
              </TableCell>
              <TableCell>
                {school.pendingForms > 0 ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {school.pendingForms}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewSchool(school.id)}
                >
                  <Eye className="h-4 w-4 mr-1" /> {t('view')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolsTable;
