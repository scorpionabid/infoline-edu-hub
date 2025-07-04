import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square } from 'lucide-react';
import { Column } from '@/utils/reports/schoolColumnDataUtils';

interface ColumnSelectionPanelProps {
  columns: Column[];
  selectedColumnIds: string[];
  selectedCategory: string;
  onColumnSelect: (columnId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const ColumnSelectionPanel: React.FC<ColumnSelectionPanelProps> = ({
  columns,
  selectedColumnIds,
  selectedCategory,
  onColumnSelect,
  onSelectAll
}) => {
  if (columns.length === 0) return null;

  const isSpecificCategory = selectedCategory !== 'all';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>
          Sütunları Seçin ({selectedColumnIds.length}
          {isSpecificCategory ? `/${columns.length}` : ''} seçilib):
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(true)}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Hamısını Seç
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(false)}
          >
            <Square className="h-4 w-4 mr-1" />
            Seçimi Təmizlə
          </Button>
        </div>
      </div>
      <div className="mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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

export default ColumnSelectionPanel;
