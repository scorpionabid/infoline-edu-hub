
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table';

interface SchoolsTableProps {
  schools: SchoolStat[];
  onViewDetailsClick?: (schoolId: string) => void;
}

export const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools = [],
  onViewDetailsClick,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleViewClick = (schoolId: string) => {
    if (onViewDetailsClick) {
      onViewDetailsClick(schoolId);
    } else {
      navigate(`/schools/${schoolId}`);
    }
  };

  const getCompletionColorClass = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('schoolName')}</TableHead>
            <TableHead className="text-right">{t('completionRate')}</TableHead>
            <TableHead className="text-center">{t('formSubmissions')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                {t('noSchoolsFound')}
              </TableCell>
            </TableRow>
          ) : (
            schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell className="text-right">
                  <span className={getCompletionColorClass(school.completionRate || 0)}>
                    {school.completionRate || 0}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-normal">
                    {school.formsCompleted || 0}/{school.formsTotal || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewClick(school.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t('view')}
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
