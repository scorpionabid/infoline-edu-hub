
import React from 'react';
import { School, SchoolStat } from '@/types/school';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Badge,
  Button
} from '@/components/ui';
import { formatDate, formatPercentage } from '@/utils/formatters';
import { Eye, ArrowUpRight } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';

interface SchoolsTableProps {
  schools: SchoolStat[];
  onViewSchool: (schoolId: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools, onViewSchool }) => {
  const { t } = useLanguageSafe();

  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        {t('noSchoolsFound')}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('schoolName')}</TableHead>
            <TableHead className="text-right">{t('completionRate')}</TableHead>
            <TableHead>{t('formsCompleted')}</TableHead>
            <TableHead>{t('pendingForms')}</TableHead>
            <TableHead>{t('lastUpdate')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell className="text-right">
                <div className="inline-block w-16 text-right font-medium">
                  {formatPercentage(school.completionRate)}
                </div>
              </TableCell>
              <TableCell>
                {school.formsCompleted || 0}/{school.totalForms || 0}
              </TableCell>
              <TableCell>
                {school.pendingForms > 0 ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {school.pendingForms} {t('pending')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {t('none')}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(school.lastUpdate)}</TableCell>
              <TableCell>
                <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                  {school.status === 'active' ? t('active') : t('inactive')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewSchool(school.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('view')}
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
