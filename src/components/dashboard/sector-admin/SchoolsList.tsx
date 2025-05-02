
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface SchoolStat {
  id: string;
  name: string;
  completion: number;
}

interface SchoolsListProps {
  schools: SchoolStat[];
}

export const SchoolsList: React.FC<SchoolsListProps> = ({ schools }) => {
  const navigate = useNavigate();

  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) => a.completion - b.completion);
  }, [schools]);

  if (!sortedSchools || sortedSchools.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Göstəriləcək məktəb yoxdur
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Məktəb</TableHead>
            <TableHead className="w-[200px] text-right">Tamamlanma</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSchools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Progress 
                    value={school.completion} 
                    className="h-2 w-[100px]"
                    indicatorClassName={
                      school.completion > 80 ? "bg-green-500" :
                      school.completion > 50 ? "bg-blue-500" :
                      school.completion > 30 ? "bg-yellow-500" : "bg-red-500"
                    }
                  />
                  <span className="w-8 text-sm">{Math.round(school.completion)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/schools/${school.id}`)}
                >
                  İncələ
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
