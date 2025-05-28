
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';

interface SchoolsTableProps {
  schools: SchoolStat[];
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRowClick = (schoolId: string) => {
    navigate(`/schools/${schoolId}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('schoolName')}</TableHead>
            <TableHead className="text-right">{t('completionRate')}</TableHead>
            <TableHead className="text-right">{t('pendingForms')}</TableHead>
            <TableHead className="text-right">{t('lastUpdate')}</TableHead>
            <TableHead className="text-center">{t('status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                {t('noSchoolsFound')}
              </TableCell>
            </TableRow>
          ) : (
            schools.map((school) => (
              <TableRow 
                key={school.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(school.id)}
              >
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell className="text-right">
                  {Math.round(school.completionRate)}%
                </TableCell>
                <TableCell className="text-right">
                  {school.pendingForms || school.pendingCount || 0}
                </TableCell>
                <TableCell className="text-right">
                  {school.lastUpdate ? format(new Date(school.lastUpdate), 'dd.MM.yyyy') : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={school.status === 'active' ? 'default' : 'outline'}>
                    {school.status === 'active' ? t('active') : t('inactive')}
                  </Badge>
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
