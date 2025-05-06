
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableViewProps {
  data: Record<string, any>[];
  columns?: string[];
}

const TableView: React.FC<TableViewProps> = ({ data, columns = [] }) => {
  const tableColumns = columns.length > 0 
    ? columns 
    : data.length > 0 
      ? Object.keys(data[0])
      : [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map(column => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {tableColumns.map(column => (
                <TableCell key={`${index}-${column}`}>{row[column]?.toString() || '-'}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">Məlumat yoxdur</div>
      )}
    </div>
  );
};

export default TableView;
