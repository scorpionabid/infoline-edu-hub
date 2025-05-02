
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

export interface CategoryStat {
  id: string;
  name: string;
  totalEntries: number;
  pendingEntries: number;
  approvedEntries: number;
  completionPercentage: number;
}

interface CategoriesListProps {
  categories: CategoryStat[];
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Göstəriləcək kateqoriya yoxdur
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kateqoriya</TableHead>
            <TableHead className="w-[100px] text-right">Gözləmədə</TableHead>
            <TableHead className="w-[100px] text-right">Təsdiqlənmiş</TableHead>
            <TableHead className="w-[200px] text-right">Tamamlanma</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-right">{category.pendingEntries}</TableCell>
              <TableCell className="text-right">{category.approvedEntries}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Progress 
                    value={category.completionPercentage} 
                    className="h-2 w-[100px]"
                    indicatorClassName={
                      category.completionPercentage > 80 ? "bg-green-500" :
                      category.completionPercentage > 50 ? "bg-blue-500" :
                      category.completionPercentage > 30 ? "bg-yellow-500" : "bg-red-500"
                    }
                  />
                  <span className="w-8 text-sm">
                    {Math.round(category.completionPercentage)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
