
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface SectorCompletionItem {
  id: string;
  name: string;
  completion: number;
  schoolCount: number;
}

interface SectorsListProps {
  sectors: SectorCompletionItem[];
}

export const SectorsList: React.FC<SectorsListProps> = ({ sectors }) => {
  const navigate = useNavigate();
  
  if (!sectors || sectors.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Göstəriləcək sektor yoxdur
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sektor</TableHead>
            <TableHead className="w-[100px] text-right">Məktəb sayı</TableHead>
            <TableHead className="w-[200px] text-right">Tamamlanma</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell className="text-right">{sector.schoolCount}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Progress 
                    value={sector.completion} 
                    className="h-2 w-[100px]"
                    indicatorClassName={
                      sector.completion > 80 ? "bg-green-500" :
                      sector.completion > 50 ? "bg-blue-500" :
                      sector.completion > 30 ? "bg-yellow-500" : "bg-red-500"
                    }
                  />
                  <span className="w-8 text-sm">{Math.round(sector.completion)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/sectors/${sector.id}`)}
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
