
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStats } from '@/types/dashboard';

interface SchoolsTableProps {
  schools: SchoolStats[];
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ schools }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noSchoolsFound')}
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('schoolName')}</TableHead>
            <TableHead>{t('formsCompleted')}</TableHead>
            <TableHead>{t('completionRate')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>{school.formsCompleted} / {school.formsTotal}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={school.completionRate} className="h-2 w-24" />
                  <span className="text-sm text-muted-foreground">
                    {school.completionRate}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/schools/${school.id}`)}
                >
                  {t('details')}
                  <ArrowRight className="ml-2 h-4 w-4" />
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
