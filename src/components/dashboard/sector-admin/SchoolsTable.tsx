
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/school';
import { formatDate } from '@/utils/formatters';

interface SchoolsTableProps {
  schools: SchoolStat[];
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('school')}</TableHead>
          <TableHead>{t('completionStatus')}</TableHead>
          <TableHead className="text-right">{t('pendingForms')}</TableHead>
          <TableHead className="text-right">{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell className="font-medium">{school.name}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      school.completionRate >= 90 ? "success" : 
                      school.completionRate >= 50 ? "warning" : "destructive"
                    }
                  >
                    {school.completionRate}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {school.formsCompleted || 0}/{school.totalForms || 0} {t('forms')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {t('lastUpdate')}: {formatDate(school.lastUpdate) || t('never')}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant="outline" className="text-amber-600">
                {school.pendingForms || 0}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/schools/${school.id}`)}
              >
                {t('view')}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SchoolsTable;
