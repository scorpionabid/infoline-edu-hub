
import React from 'react';
import { 
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/school';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, FileText, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SchoolsTableProps {
  schools: SchoolStat[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onViewClick?: (schoolId: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools,
  onSort,
  sortField,
  sortDirection,
  onViewClick
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const handleViewClick = (schoolId: string) => {
    if (onViewClick) {
      onViewClick(schoolId);
    } else {
      navigate(`/schools/${schoolId}`);
    }
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {onSort ? (
              <div className="flex items-center cursor-pointer" onClick={() => onSort('name')}>
                {t('schoolName')}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            ) : (
              t('schoolName')
            )}
          </TableHead>
          <TableHead>{t('principal')}</TableHead>
          <TableHead>{t('completionRate')}</TableHead>
          <TableHead>{t('pendingForms')}</TableHead>
          <TableHead>{t('lastUpdate')}</TableHead>
          <TableHead>{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
              {t('noSchoolsFound')}
            </TableCell>
          </TableRow>
        ) : (
          schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>{school.principalName || school.principal || '—'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={school.completionRate} 
                    className="h-2 w-20" 
                    indicatorClassName={
                      school.completionRate < 30 ? "bg-red-500" : 
                      school.completionRate < 70 ? "bg-amber-500" : 
                      "bg-green-500"
                    } 
                  />
                  <span>{Math.round(school.completionRate)}%</span>
                </div>
              </TableCell>
              <TableCell>
                {(school.pendingForms || 0) > 0 ? (
                  <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                    {school.pendingForms}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    0
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(school.lastUpdate)}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewClick(school.id)}
                >
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">{t('view')}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default SchoolsTable;
