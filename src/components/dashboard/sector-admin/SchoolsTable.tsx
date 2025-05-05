
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, FileText } from 'lucide-react';
import { SchoolStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolsTableProps {
  schools: SchoolStat[];
  onViewDetails?: (school: SchoolStat) => void;
  onViewSubmissions?: (school: SchoolStat) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools, 
  onViewDetails,
  onViewSubmissions
}) => {
  const { t } = useLanguage();
  
  // Form statusuna görə badge rengi və adı
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('completed')}</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t('inProgress')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('pending')}</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t('overdue')}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{t('notStarted')}</Badge>;
    }
  };
  
  if (!schools || schools.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
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
            <TableHead>{t('region')}</TableHead>
            <TableHead>{t('completionRate')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('lastUpdate')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>{school.region || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={school.completion || school.completionRate || 0} className="h-2 w-24" />
                  <span className="text-sm text-gray-500">{school.completion || school.completionRate || 0}%</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(school.formStatus)}</TableCell>
              <TableCell>{school.lastUpdate || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onViewDetails && (
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(school)}>
                      <Eye className="h-4 w-4 mr-1" />
                      {t('details')}
                    </Button>
                  )}
                  {onViewSubmissions && (
                    <Button variant="outline" size="sm" onClick={() => onViewSubmissions(school)}>
                      <FileText className="h-4 w-4 mr-1" />
                      {t('submissions')}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolsTable;
