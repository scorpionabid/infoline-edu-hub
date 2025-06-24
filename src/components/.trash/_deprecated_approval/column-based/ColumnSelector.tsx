import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Grid3X3, 
  ChevronRight,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { ColumnInfo, CategoryWithColumnCount } from '@/types/columnBasedApproval';
import { useTranslation } from '@/contexts/TranslationContext';

interface ColumnSelectorProps {
  categories: CategoryWithColumnCount[];
  columns: ColumnInfo[];
  selectedColumnId: string | null;
  selectedCategoryId: string | null;
  isLoadingCategories: boolean;
  isLoadingColumns: boolean;
  onCategorySelect: (categoryId: string) => void;
  onColumnSelect: (columnId: string) => void;
  className?: string;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  categories,
  columns,
  selectedColumnId,
  selectedCategoryId,
  isLoadingCategories,
  isLoadingColumns,
  onCategorySelect,
  onColumnSelect,
  className
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCategoryId || '');

  // Filter columns based on search
  const filteredColumns = columns.filter(column => 
    column.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    column.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId);
  };

  const getColumnIcon = (type: string) => {
    switch (type) {
      case 'number':
        return '🔢';
      case 'date':
        return '📅';
      case 'select':
        return '📋';
      case 'checkbox':
        return '☑️';
      case 'email':
        return '📧';
      case 'url':
        return '🔗';
      case 'file':
        return '📎';
      default:
        return '📝';
    }
  };

  const getColumnTypeBadge = (type: string) => {
    const typeColors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      select: 'bg-orange-100 text-orange-800',
      checkbox: 'bg-pink-100 text-pink-800',
      email: 'bg-cyan-100 text-cyan-800',
      url: 'bg-teal-100 text-teal-800',
      file: 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = typeColors[type as keyof typeof typeColors] || typeColors.text;
    
    return (
      <Badge variant="outline" className={`text-xs ${colorClass}`}>
        {type}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Sütun Seçimi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Təsdiq etmək istədiyiniz sütunu seçin
          </p>
        </div>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kateqoriya Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCategories ? (
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
              <div className="text-sm text-muted-foreground">Kateqoriyalar yüklənir...</div>
            </div>
          ) : (
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya seçin..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {category.columnCount} sütun
                        </Badge>
                        {category.pendingCount > 0 && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            {category.pendingCount} gözləyən
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Column Selection */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sütun Seçimi</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sütun adına görə axtarın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredColumns.length} / {columns.length} sütun
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingColumns ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredColumns.length === 0 ? (
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Sütun tapılmadı</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Axtarış şərtinizə uyğun sütun yoxdur' : 'Bu kateqoriyada hələ sütun yoxdur'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredColumns.map((column) => {
                  const isSelected = column.id === selectedColumnId;
                  
                  return (
                    <div
                      key={column.id}
                      className={`
                        relative flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => onColumnSelect(column.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getColumnIcon(column.type)}</div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {column.name}
                            {column.isRequired && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                Məcburi
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {getColumnTypeBadge(column.type)}
                            <span>•</span>
                            <span>Sıra: {column.orderIndex || 0}</span>
                          </div>
                          {column.helpText && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {column.helpText}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Badge variant="default" className="bg-blue-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Seçilmiş
                          </Badge>
                        )}
                        <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                      
                      {isSelected && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColumnSelector;
