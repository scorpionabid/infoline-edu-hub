
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Column } from '@/types/column';

interface DataEntryTableData {
  columns: Column[];
  values: Record<string, any>;
}

interface DataEntryTableProps {
  data: DataEntryTableData;
}

const DataEntryTable: React.FC<DataEntryTableProps> = ({ data }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {data.columns.map((column) => (
              <TableHead key={column.id}>{column.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {data.columns.map((column) => (
              <TableCell key={column.id}>
                {data.values[column.id] || '-'}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default DataEntryTable;
