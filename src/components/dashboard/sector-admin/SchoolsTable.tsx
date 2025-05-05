
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchoolStats } from '@/types/dashboard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SchoolsTableProps {
  schools: SchoolStats[];
  onViewDetails?: (schoolId: string) => void;
  maxRows?: number;
  isLoading?: boolean;
}

export const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools, 
  onViewDetails, 
  maxRows = 5,
  isLoading
}) => {
  const navigate = useNavigate();
  
  // Yükləmə statusu
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Məlumatlar yüklənir...</p>
      </div>
    );
  }
  
  // Məktəb məlumatları yoxdursa
  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Məktəb məlumatları tapılmadı
      </div>
    );
  }
  
  // Məlumatları limitlə göstər
  const displayedSchools = maxRows ? schools.slice(0, maxRows) : schools;
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Məktəb adı</TableHead>
            <TableHead>Tamamlanma</TableHead>
            <TableHead>Formlar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedSchools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={school.completionRate} 
                    className={cn(
                      "h-2 w-16 md:w-24", 
                      school.completionRate < 30 ? "bg-red-100" : 
                      school.completionRate < 70 ? "bg-amber-100" : "bg-green-100"
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    {school.completionRate}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {school.formsCompleted}/{school.formsTotal}
                </span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    school.completionRate === 100 ? "success" : 
                    school.completionRate >= 50 ? "outline" : "destructive"
                  }
                  className="text-xs"
                >
                  {school.completionRate === 100 ? "Tamamlanıb" : 
                   school.completionRate >= 50 ? "Davam edir" : "Geridə qalır"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails 
                    ? onViewDetails(school.id) 
                    : navigate(`/schools/${school.id}`)
                  }
                >
                  Ətraflı
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {maxRows && schools.length > maxRows && (
        <div className="py-2 px-4 border-t text-center">
          <Button 
            variant="link" 
            onClick={() => navigate('/schools')}
          >
            Bütün məktəbləri göstər ({schools.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default SchoolsTable;
