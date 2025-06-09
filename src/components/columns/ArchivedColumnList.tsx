import React from 'react';
import { Button } from '@/components/ui/button';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import { RotateCcw, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ArchivedColumnListProps {
  columns: Column[];
  categories?: Category[];
  isLoading?: boolean;
  isError?: boolean;
  onRestoreColumn?: (id: string, name: string) => void;
  onPermanentDelete?: (id: string, name: string) => void;
  canManageColumns?: boolean;
}

const ArchivedColumnList: React.FC<ArchivedColumnListProps> = ({ 
  columns, 
  categories,
  isLoading, 
  isError, 
  onRestoreColumn, 
  onPermanentDelete,
  canManageColumns 
}) => {
  const getCategoryName = (categoryId: string) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Naməlum kateqoriya';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Naməlum tarix';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      {columns.map((column) => (
        <div 
          key={column.id} 
          className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-medium text-gray-700 line-through">
                {column.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {column.type}
              </Badge>
              {column.is_required && (
                <Badge variant="secondary" className="text-xs">
                  Məcburi
                </Badge>
              )}
              <Badge variant="destructive" className="text-xs">
                Arxivdə
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>Kateqoriya:</span>
                <span className="font-medium">{getCategoryName(column.category_id)}</span>
              </div>
              
              {column.updated_at && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Arxivləşmə:</span>
                  <span>{formatDate(column.updated_at)}</span>
                </div>
              )}
            </div>
            
            {column.help_text && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                {column.help_text}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {canManageColumns && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onRestoreColumn?.(column.id, column.name)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Bərpa et
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onPermanentDelete?.(column.id, column.name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Tam sil
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchivedColumnList;