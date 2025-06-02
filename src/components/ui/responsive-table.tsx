
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/common/useMobile';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  showScrollbar?: boolean;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  children, 
  className,
  showScrollbar = true 
}) => {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="w-full" type={showScrollbar ? 'auto' : 'never'}>
          <div className="min-w-[600px]">
            <Table className={cn('text-sm', className)}>
              {children}
            </Table>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className={className}>
        {children}
      </Table>
    </div>
  );
};

// Mobile-optimized table cell
interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({ 
  children, 
  className,
  hideOnMobile = false 
}) => {
  const isMobile = useMobile();

  if (isMobile && hideOnMobile) {
    return null;
  }

  return (
    <TableCell className={cn(
      'px-2 py-3 sm:px-4',
      isMobile && 'text-xs',
      className
    )}>
      {children}
    </TableCell>
  );
};

// Mobile-optimized table header
const ResponsiveTableHead: React.FC<ResponsiveTableCellProps> = ({ 
  children, 
  className,
  hideOnMobile = false 
}) => {
  const isMobile = useMobile();

  if (isMobile && hideOnMobile) {
    return null;
  }

  return (
    <TableHead className={cn(
      'px-2 py-3 sm:px-4',
      isMobile && 'text-xs font-medium',
      className
    )}>
      {children}
    </TableHead>
  );
};

export { ResponsiveTable, ResponsiveTableCell, ResponsiveTableHead, TableBody, TableHeader, TableRow };
