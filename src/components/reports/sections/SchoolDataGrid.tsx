import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';

interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

interface SchoolColumnData {
  school_id: string;
  school_name: string;
  region_name: string;
  sector_name: string;
  columns: {
    [columnId: string]: {
      value: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }
  };
}

interface SchoolDataGridProps {
  schoolColumnData: SchoolColumnData[];
  selectedColumns: Column[];
  loading: boolean;
}

const SchoolDataGrid: React.FC<SchoolDataGridProps> = ({
  schoolColumnData,
  selectedColumns,
  loading
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'approved': { variant: 'default', label: 'Təsdiqlənmiş', className: 'bg-green-100 text-green-800' },
      'pending': { variant: 'secondary', label: 'Gözləmədə', className: 'bg-yellow-100 text-yellow-800' },
      'rejected': { variant: 'destructive', label: 'Rədd edilmiş', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Məlumatlar yüklənir...</span>
        </div>
      </div>
    );
  }

  if (schoolColumnData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Seçilmiş filtrələrə uyğun məlumat tapılmadı
      </div>
    );
  }

  return (
    <ScrollArea className="h-96 w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Məktəb</TableHead>
            <TableHead className="w-[120px]">Region</TableHead>
            <TableHead className="w-[120px]">Sektor</TableHead>
            {selectedColumns.map((column) => (
              <TableHead key={column.id} className="min-w-[150px]">
                {column.name}
                {column.is_required && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    Məcburi
                  </Badge>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {schoolColumnData.map((schoolData) => (
            <TableRow key={schoolData.school_id}>
              <TableCell className="font-medium">
                {schoolData.school_name}
              </TableCell>
              <TableCell>{schoolData.region_name}</TableCell>
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
                          {getStatusBadge(columnData.status)}
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

export default SchoolDataGrid;