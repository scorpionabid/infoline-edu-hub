
import React from 'react';
import { SchoolStat } from '@/types/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPercentage, formatDate } from '@/utils/formatters';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolsTableProps {
  schools: SchoolStat[];
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools }) => {
  const { t } = useLanguage();

  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noSchoolsData')}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('school')}</TableHead>
            <TableHead>{t('completionRate')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('principal')}</TableHead>
            <TableHead className="text-right">{t('status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">
                {school.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{formatPercentage(school.completionRate)}</span>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className={`h-1.5 rounded-full ${
                        (school.completionRate || 0) >= 75 ? 'bg-green-500' : 
                        (school.completionRate || 0) >= 50 ? 'bg-amber-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${school.completionRate || 0}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {school.principal || school.principalName || '-'}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                  {school.status === 'active' ? t('active') : t('inactive')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolsTable;
