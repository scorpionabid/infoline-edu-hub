
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
  }>;
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  onRowClick 
}) => {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('ui.no_data_available')}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {row[column.key] || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
