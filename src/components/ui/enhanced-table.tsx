
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface EnhancedTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    className?: string;
    mobileHidden?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  className?: string;
  mobileScrollable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

const EnhancedTable: React.FC<EnhancedTableProps> = ({
  data,
  columns,
  className,
  mobileScrollable = true,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const tableContent = (
    <Table className={cn('min-w-full', className)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                column.className,
                column.mobileHidden && 'hidden sm:table-cell'
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.mobileHidden && 'hidden sm:table-cell'
                  )}
                >
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          // Empty state
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center text-muted-foreground py-8"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          // Data rows
          data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.className,
                    column.mobileHidden && 'hidden sm:table-cell'
                  )}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (mobileScrollable) {
    return (
      <div className="border rounded-md">
        <ScrollArea className="h-auto max-h-[70vh] w-full">
          {tableContent}
        </ScrollArea>
      </div>
    );
  }

  return <div className="border rounded-md overflow-hidden">{tableContent}</div>;
};

export { EnhancedTable };
