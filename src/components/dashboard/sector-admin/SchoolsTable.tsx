
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { School, SchoolStat } from '@/types/school';
import { formatDate } from '@/utils/formatters';

interface SchoolsTableProps {
  schools: SchoolStat[];
  onViewDetails?: (schoolId: string) => void;
}

export const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools,
  onViewDetails
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };
  
  const handleViewClick = (id: string) => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      navigate(`/schools/${id}`);
    }
  };
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('principal')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('completionRate')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('lastUpdate')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map(school => (
            <TableRow key={school.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{school.name}</div>
                  <div className="text-sm text-muted-foreground hidden sm:block">{school.formsCompleted || 0}/{school.totalForms || 0} {t('forms')}</div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{school.principal || '-'}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Progress value={school.completionRate} className="h-2 w-16 sm:w-24" />
                  <span className="text-sm">{Math.round(school.completionRate)}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {school.lastUpdate ? formatDate(school.lastUpdate) : '-'}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline" className={getStatusColor(school.status)}>
                  {t(school.status.toLowerCase())}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewClick(school.id)}
                >
                  {t('view')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          {schools.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                {t('noSchoolsFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolsTable;
