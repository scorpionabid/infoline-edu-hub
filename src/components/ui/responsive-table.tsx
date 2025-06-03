
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  height?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
  scrollable = true,
  height = '400px'
}) => {
  const tableContent = (
    <Table className={cn('min-w-full', className)}>
      {children}
    </Table>
  );

  if (scrollable) {
    return (
      <ScrollArea className="rounded-md border" style={{ height }}>
        <div className="overflow-x-auto">
          {tableContent}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      {tableContent}
    </div>
  );
};

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
export default ResponsiveTable;
