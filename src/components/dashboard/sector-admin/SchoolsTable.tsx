
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';
import { formatDate } from '@/utils/formatters';

interface SchoolsTableProps {
  schools: SchoolStat[];
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools }) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktiv</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Qeyri-aktiv</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Məktəb adı</TableHead>
          <TableHead>Tamamlanma</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Son yeniləmə</TableHead>
          <TableHead>Əlaqə</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell className="font-medium">{school.name}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Progress value={school.completionRate} className="h-2 w-20" />
                <span className={getCompletionColor(school.completionRate)}>
                  {school.completionRate}%
                </span>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(school.status)}</TableCell>
            <TableCell>
              {school.lastUpdate ? formatDate(school.lastUpdate) : 'N/A'}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{school.principalName}</div>
                <div className="text-muted-foreground text-xs">{school.email || 'N/A'}</div>
              </div>
            </TableCell>
          </TableRow>
        ))}

        {schools.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-32 text-center">
              {t('noSchools')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default SchoolsTable;
