import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

interface ColumnSelectorProps {
  columns: Column[];
  selectedColumnIds: string[];
  onColumnSelect: (columnId: string, checked: boolean) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumnIds,
  // onColumnSelect
}) => {
  if (columns.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Kateqoriya seçindikdən sonra sütunlar görünəcək
      </div>
    );
  }

  return (
    <div>
      <Label>Sütunları Seçin ({selectedColumnIds.length} seçilib):</Label>
      <div className="mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={selectedColumnIds.includes(column.id)}
                onCheckedChange={(checked) => onColumnSelect(column.id, checked as boolean)}
              />
              <Label htmlFor={column.id} className="text-sm cursor-pointer">
                {column.name}
                {column.is_required && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    Məcburi
                  </Badge>
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;