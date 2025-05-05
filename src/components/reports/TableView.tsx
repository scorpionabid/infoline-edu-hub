
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableViewProps {
  data: any[];
  columns: {
    id: string;
    header: string;
    accessor: string | ((row: any) => React.ReactNode);
  }[];
}

export const TableView: React.FC<TableViewProps> = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center">Məlumat tapılmadı</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column.id}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map(column => (
                <TableCell key={`${rowIndex}-${column.id}`}>
                  {typeof column.accessor === 'function' 
                    ? column.accessor(row)
                    : row[column.accessor]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableView;
