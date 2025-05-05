
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, FileText } from 'lucide-react';
import { SchoolStat } from '@/types/dashboard';

interface SchoolsTableProps {
  schools: SchoolStat[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500">Tamamlanıb</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-500">Davam edir</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500">Gözləyir</Badge>;
    case 'overdue':
      return <Badge className="bg-red-500">Gecikib</Badge>;
    default:
      return <Badge className="bg-gray-500">Naməlum</Badge>;
  }
};

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools }) => {
  const { t } = useLanguage();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('school')}</TableHead>
          <TableHead>{t('region')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('completion')}</TableHead>
          <TableHead>{t('lastUpdate')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell className="font-medium">{school.name}</TableCell>
            <TableCell>{school.region}</TableCell>
            <TableCell>{getStatusBadge(school.formStatus)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={school.completion} className="w-24 h-2" />
                <span className="text-sm">{school.completion}%</span>
              </div>
            </TableCell>
            <TableCell>{new Date(school.lastUpdate).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SchoolsTable;
