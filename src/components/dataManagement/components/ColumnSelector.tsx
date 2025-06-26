import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Grid3X3, 
  Loader2,
  Database,
  Building2,
  AlertCircle,
  // FileText
} from 'lucide-react';
import { Category, Column } from '@/hooks/dataManagement/useDataManagement';

interface ColumnSelectorProps {
  category: Category;
  columns: Column[];
  loading: boolean;
  onColumnSelect: (column: Column) => void;
  onBack: () => void;
}

/**
 * Column Selector Component
 * 
 * Displays columns for the selected category in a list format.
 * Shows column metadata like type, requirements, and help text.
 * 
 * Features:
 * - Column list with metadata
 * - Type indicators and required badges
 * - Help text display
 * - Back navigation
 * - Loading skeleton states
 */
export const ColumnSelector: React.FC<ColumnSelectorProps> = memo(({
  category,
  columns,
  loading,
  onColumnSelect,
  // onBack
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sütunlar yüklənir...</h3>
          <p className="text-muted-foreground">
            {category.name} kateqoriyası üçün sütunlar hazırlanır
          </p>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          // Geri
        </Button>
        <div>
          <h3 className="text-2xl font-bold">Sütun Seçimi</h3>
          <p className="text-muted-foreground">
            {category.name} kateqoriyası üçün sütun seçin
          </p>
        </div>
      </div>

      {/* Category Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {category.assignment === 'sectors' ? (
                <Database className="h-5 w-5 text-blue-600" />
              ) : (
                <Building2 className="h-5 w-5 text-green-600" />
              )}
              <div>
                <div className="font-medium text-lg">{category.name}</div>
                <div className="text-sm text-muted-foreground">
                  {category.assignment === 'sectors' ? 'Sektor Məlumatı' : 'Məktəb Məlumatları'}
                </div>
              </div>
            </div>
            <Badge variant={category.assignment === 'sectors' ? 'default' : 'secondary'}>
              {category.assignment === 'sectors' 
                ? 'Bu məlumat birbaşa sektor üçün qeyd ediləcək'
                : 'Bu məlumat məktəblər üçün daxil ediləcək'
              }
            </Badge>
          </div>
          {category.description && (
            <div className="mt-3 text-sm text-blue-700">
              {category.description}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Columns List */}
      {columns.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Sütun tapılmadı</h3>
          <p className="text-muted-foreground mb-4">
            Bu kateqoriya üçün heç bir sütun tapılmadı
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded inline-block">
            Kateqoriya: {category.name} • Assignment: {category.assignment}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground mb-4">
            {columns.length} sütun tapıldı
          </div>
          
          {columns.map((column) => (
            <Card 
              key={column.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] group"
              onClick={() => onColumnSelect(column)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Grid3X3 className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <div>
                      <div className="font-medium group-hover:text-blue-600 transition-colors">
                        {column.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tip: <span className="font-medium">{column.type}</span>
                        {column.is_required && (
                          <span className="ml-2 text-red-600">• Məcburi</span>
                        )}
                        {column.placeholder && (
                          <span className="ml-2">• {column.placeholder}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {column.is_required && (
                      <Badge variant="destructive" className="text-xs">
                        Məcburi
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {column.type}
                    </Badge>
                  </div>
                </div>
                
                {column.help_text && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      {column.help_text}
                    </div>
                  </div>
                )}
                
                {column.options && column.options.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Seçimlər:</div>
                    <div className="flex flex-wrap gap-1">
                      {column.options.slice(0, 5).map((option: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option.label || option.value || option}
                        </Badge>
                      ))}
                      {column.options.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{column.options.length - 5} daha
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {columns.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
            <Grid3X3 className="h-4 w-4" />
            <span>
              {columns.filter(c => c.is_required).length} məcburi, {' '}
              {columns.filter(c => !c.is_required).length} ixtiyari sütun
            </span>
          </div>
        </div>
      )}
    </div>
  );
});