
import React from 'react';
import { Column } from '@/types/column';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ColumnListProps {
  columns: Column[];
  onEdit?: (column: Column) => void;
  onDelete?: (columnId: string) => void;
}

const ColumnList: React.FC<ColumnListProps> = ({ columns, onEdit, onDelete }) => {
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
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(column)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(column.id)}>
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
