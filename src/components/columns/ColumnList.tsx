import React from 'react';
import { Button } from '@/components/ui/button';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ColumnListProps {
  columns: Column[];
  categories?: Category[];
  isLoading?: boolean;
  isError?: boolean;
  onEditColumn?: (column: Column) => void;
  onDeleteColumn?: (id: string, name: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  canManageColumns?: boolean;
}

const ColumnList: React.FC<ColumnListProps> = ({ 
  columns, 
  categories,
  isLoading, 
  isError, 
  onEditColumn, 
  onDeleteColumn, 
  onUpdateStatus,
  canManageColumns 
}) => {
  return (
    <div className="space-y-2">
      {columns.map((column) => (
        <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{column.name}</span>
              <Badge variant="outline">{column.type}</Badge>
              {column.is_required && <Badge variant="secondary">Required</Badge>}
            </div>
            {column.description && (
              <p className="text-sm text-muted-foreground mt-1">{column.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {onEditColumn && (
              <Button variant="ghost" size="sm" onClick={() => onEditColumn(column)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDeleteColumn && (
              <Button variant="ghost" size="sm" onClick={() => onDeleteColumn(column.id, column.name)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColumnList;
