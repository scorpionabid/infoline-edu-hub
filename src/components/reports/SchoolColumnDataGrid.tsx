import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { 
  Column, 
  SchoolColumnData, 
  ColumnSort,
  getStatusBadge 
} from '@/utils/reports/schoolColumnDataUtils';

interface SchoolColumnDataGridProps {
  schoolColumnData: SchoolColumnData[];
  selectedColumns: Column[];
  columnSort: ColumnSort;
  onColumnSort: (columnId: string) => void;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
}

const SchoolColumnDataGrid: React.FC<SchoolColumnDataGridProps> = ({
  schoolColumnData,
  selectedColumns,
  columnSort,
  onColumnSort,
  isLoading,
  currentPage,
  // pageSize
}) => {
  const getSortIcon = (columnId: string) => {
    if (columnSort.columnId !== columnId) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (columnSort.order === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (columnSort.order === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const renderStatusBadge = (status: string) => {
    const badgeConfig = getStatusBadge(status);
    return (
      <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
        {badgeConfig.label}
      </Badge>
    );
  };

  // Paginated data
  const paginatedSchoolData = schoolColumnData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Məlumatlar yüklənir...</span>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96 w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Məktəb</TableHead>
            <TableHead className="w-[150px]">Sektor</TableHead>
            {selectedColumns.map((column) => (
              <TableHead key={column.id} className="min-w-[150px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {column.name}
                    {column.is_required && (
                      <Badge variant="outline" className="text-xs">
                        Məcburi
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => onColumnSort(column.id)}
                    title="Sırala"
                  >
                    {getSortIcon(column.id)}
                  </Button>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedSchoolData.map((schoolData) => (
            <TableRow key={schoolData.school_id}>
              <TableCell className="font-medium">
                {schoolData.school_name}
              </TableCell>
              <TableCell>{schoolData.sector_name}</TableCell>
              {selectedColumns.map((column) => {
                const columnData = schoolData.columns[column.id];
                return (
                  <TableCell key={column.id}>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {columnData?.value || (
                          <span className="text-muted-foreground italic">
                            Daxil edilməyib
                          </span>
                        )}
                      </div>
                      {columnData && (
                        <div className="flex items-center gap-1">
                          {renderStatusBadge(columnData.status)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default SchoolColumnDataGrid;
