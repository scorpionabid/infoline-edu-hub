
import React from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { School } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStats } from '@/types/dashboard';

interface SchoolsTableProps {
  schools: SchoolStats[];
  onViewDetails: (schoolId: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools, onViewDetails }) => {
  const { t } = useLanguage();
  
  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>{t('noSchoolsFound')}</p>
      </div>
    );
  }
  
  // Helper funksiya: Tamamlanma statusunu hesablayır
  const getCompletionStatus = (completionRate: number | undefined) => {
    if (!completionRate && completionRate !== 0) return { text: t('noData'), bgClass: 'bg-gray-50 text-gray-700 border-gray-200' };
    
    if (completionRate === 100) {
      return { text: t('completed'), bgClass: 'bg-green-50 text-green-700 border-green-200' };
    } else if (completionRate > 0) {
      return { text: t('inProgress'), bgClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { text: t('notStarted'), bgClass: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t('school')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('completionStatus')}</TableHead>
            <TableHead>{t('completionRate')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => {
            const completionStatus = getCompletionStatus(school.completionRate);
            const formDisplay = school.formsCompleted !== undefined && school.formsTotal !== undefined 
              ? `${school.formsCompleted} / ${school.formsTotal}`
              : '-';
            
            return (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name || 'Unknown School'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge 
                    variant="outline" 
                    className={cn(completionStatus.bgClass)}
                  >
                    {completionStatus.text}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={school.completionRate || 0} 
                      className="h-2 w-24" 
                    />
                    <span className="text-sm tabular-nums">
                      {school.completionRate !== undefined ? `${school.completionRate}%` : '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewDetails(school.id || '')}
                    className="h-7 px-2"
                  >
                    <School className="h-3 w-3 mr-1" />
                    <span className="text-xs">{t('details')}</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolsTable;
