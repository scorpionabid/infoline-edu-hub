import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Column {
  id: string;
  name: string;
  description?: string;
  type: string;
  options?: string[];
}

interface ColumnSelectorProps {
  columns: Column[];
  selectedColumnId: string | null;
  onColumnSelect: (columnId: string) => void;
  isLoading?: boolean;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumnId,
  onColumnSelect,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(false);
  
  // Dropdown seçimi ediləndə həm onColumnSelect-i çağır, həm də siyahını göstər
  const handleColumnSelect = (columnId: string) => {
    onColumnSelect(columnId);
    setShowList(true);
  };

  // Axtarış filtri
  const filteredColumns = React.useMemo(() => {
    if (!searchTerm.trim()) return columns;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return columns.filter(column => 
      column.name.toLowerCase().includes(normalizedSearch) ||
      (column.description?.toLowerCase().includes(normalizedSearch))
    );
  }, [columns, searchTerm]);

  // Sütun tipi üçün badge rəng seçimi
  const getTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'date': return 'bg-purple-100 text-purple-800';
      case 'select': return 'bg-amber-100 text-amber-800';
      case 'boolean': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  // Əgər yüklənmə prosesindədirsə, skeleton göstər
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sütun seçin</h3>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3 mt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }
  
  // Əgər heç bir sütun yoxdursa
  if (columns.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sütun seçin</h3>
        <div className="border rounded-md p-4 text-center text-muted-foreground bg-muted/30">
          Bu kateqoriya üçün heç bir sütun tapılmadı.
          <p className="mt-1 text-sm">Zəhmət olmasa, başqa kateqoriya seçin və ya administratorla əlaqə saxlayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sütun seçin</h3>
      
      {/* Drop-down variant - mobil dostlu olması üçün */}
      <div className="mb-4">
        <Select 
          value={selectedColumnId || undefined} 
          onValueChange={handleColumnSelect}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Yüklənir..." : "Bir sütun seçin"} />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="p-2 text-center text-muted-foreground">
                Sütunlar yüklənir...
              </div>
            ) : columns.length > 0 ? (
              columns.map(column => (
                <SelectItem key={column.id} value={column.id}>
                  <div className="flex items-center gap-2">
                    <span>{column.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getTypeColor(column.type)}`}>
                      {column.type}
                    </span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">
                Bu kateqoriya üçün heç bir sütun tapılmadı
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Əgər aktiv və ya axtarışla göstirilməli sütunlar varsa, ətraflı siyahını göstər */}
      {(selectedColumnId || showList) && (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Sütunlar üzrə axtar..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="h-[350px] overflow-y-auto pr-2 mt-4">
            <RadioGroup 
              value={selectedColumnId || undefined} 
              onValueChange={onColumnSelect}
            >
              {filteredColumns.length > 0 ? (
                filteredColumns.map((column) => (
                  <div 
                    key={column.id} 
                    className={`flex items-start space-x-2 mb-3 p-3 rounded-md border 
                      ${selectedColumnId === column.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'}`}
                  >
                    <RadioGroupItem value={column.id} id={`column-${column.id}`} className="mt-1" />
                    <Label 
                      htmlFor={`column-${column.id}`} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium flex items-center gap-2">
                        <span>{column.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(column.type)}`}>
                          {column.type}
                        </span>
                      </div>
                      {column.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {column.description}
                        </div>
                      )}
                      {column.type === 'select' && column.options && column.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {column.options.map((option, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Axtarış kriteriyalarına uyğun sütun tapılmadı.
                </div>
              )}
            </RadioGroup>
          </div>
        </>
      )}
    </div>
  );
};
