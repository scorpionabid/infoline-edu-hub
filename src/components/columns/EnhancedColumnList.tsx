import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';
import { 
  Edit, 
  Trash2, 
  RotateCcw, 
  Copy, 
  MoreHorizontal,
  Eye,
  EyeOff,
  // AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedColumnListProps {
  columns: Column[];
  categories?: Category[];
  isLoading?: boolean;
  isError?: boolean;
  selectedColumns?: string[];
  onEditColumn?: (column: Column) => void;
  onDeleteColumn?: (id: string, name: string) => void;
  onRestoreColumn?: (id: string) => void;
  onPermanentDeleteColumn?: (id: string) => void; // NEW
  onDuplicateColumn?: (column: Column) => void;
  onToggleColumnStatus?: (id: string, status: 'active' | 'inactive') => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onColumnSelection?: (columnId: string) => void;
  onReorderColumns?: (reorderedColumns: Column[]) => void;
  canManageColumns?: boolean;
  enableDragDrop?: boolean;
  showBulkActions?: boolean;
}

// Column Item Component without drag & drop
interface ColumnItemProps {
  column: Column;
  categories?: Category[];
  isSelected?: boolean;
  onEdit?: (column: Column) => void;
  onDelete?: (id: string, name: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void; // NEW
  onDuplicate?: (column: Column) => void;
  onToggleStatus?: (id: string, status: 'active' | 'inactive') => void;
  onSelection?: (columnId: string) => void;
  canManage?: boolean;
  showSelection?: boolean;
}

// Memoized Column Item Component for performance
const ColumnItem: React.FC<ColumnItemProps> = React.memo(({
  column,
  categories,
  isSelected,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete, // NEW
  onDuplicate,
  onToggleStatus,
  onSelection,
  canManage,
  // showSelection
}) => {
  const getCategoryName = useCallback((categoryId: string) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Naməlum kateqoriya';
  }, [categories]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': { 
        return 'bg-green-100 text-green-800';
      }
      case 'inactive': { 
        return 'bg-yellow-100 text-yellow-800';
      }
      case 'deleted': { 
        return 'bg-red-100 text-red-800';
      }
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg transition-all",
        isSelected && "ring-2 ring-primary bg-primary/5",
        (column.status === 'deleted' || column.status === 'inactive') && "bg-amber-50 border-amber-200",
        column.status === 'inactive' && "bg-gray-50 border-gray-200"
      )}
    >
      <div className="flex items-center space-x-3 flex-1">
        {/* Selection Checkbox */}
        {showSelection && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelection?.(column.id)}
            className="data-[state=checked]:bg-primary"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={cn(
              "font-medium",
              (column.status === 'deleted' || column.status === 'inactive') && "line-through text-muted-foreground"
            )}>
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
            <Badge className={cn("text-xs", getStatusColor(column.status))}>
              {column.status === 'active' ? 'Aktiv' : 
               column.status === 'inactive' ? 'Deaktiv' : 
               column.status === 'deleted' ? 'Silinmiş' : 'Naməlum'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Kateqoriya: {getCategoryName(column.category_id)}</span>
            {column.order_index !== undefined && (
              <span>Sıra: {column.order_index}</span>
            )}
          </div>
          
          {column.help_text && (
            <p className="text-sm text-muted-foreground mt-1 italic">
              {column.help_text}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        {column.status === 'deleted' || column.status === 'inactive' ? (
          // Actions for deleted/inactive columns (archived)
          <div className="flex items-center space-x-2">
            {onRestore && canManage && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRestore(column.id)}
                className="text-green-600 hover:text-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Bərpa et
              </Button>
            )}
            {onPermanentDelete && canManage && (column.status === 'deleted' || column.status === 'inactive') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPermanentDelete(column.id)}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Təmamən sil
              </Button>
            )}
          </div>
        ) : (
          // Action buttons for active columns
          <div className="flex items-center space-x-1">
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(column)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Düzəliş et
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => onDuplicate(column)}>
                      <Copy className="h-4 w-4 mr-2" />
                      // Kopyala
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <DropdownMenuItem 
                      onClick={() => onToggleStatus(column.id, column.status === 'active' ? 'inactive' : 'active')}
                    >
                      {column.status === 'active' ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {column.status === 'active' ? 'Deaktivləşdir' : 'Aktivləşdir'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onToggleStatus && (
                    <DropdownMenuItem 
                      onClick={() => onToggleStatus(column.id, 'inactive')}
                      className="text-orange-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Arxivləşdir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Display name for debugging
ColumnItem.displayName = 'ColumnItem';

// FIXED: Changed from React.memo to regular component to avoid hook ordering issues
const EnhancedColumnList: React.FC<EnhancedColumnListProps> = ({ 
  columns, 
  categories,
  isLoading, 
  isError, 
  selectedColumns = [],
  onEditColumn, 
  onDeleteColumn,
  onRestoreColumn, 
  onPermanentDeleteColumn, // NEW
  onDuplicateColumn,
  onToggleColumnStatus,
  onUpdateStatus,
  onColumnSelection,
  onReorderColumns,
  canManageColumns = false,
  enableDragDrop = false, // Temporarily disabled
  showBulkActions = true
}) => {
  // Get user role to check if user is sectoradmin
  const role = selectUserRole(useAuthStore());
  const isSectorAdmin = role?.toLowerCase() === 'sectoradmin';
  
  // Override canManageColumns if user is sectoradmin
  const effectiveCanManageColumns = isSectorAdmin ? false : canManageColumns;
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Memoize column items to prevent unnecessary re-renders
  const columnItems = useMemo(() => {
    if (!memoizedColumns || memoizedColumns.length === 0) return [];
    
    return memoizedColumns.map((column) => (
      <ColumnItem
        key={column.id}
        column={column}
        categories={categories}
        isSelected={selectedColumns.includes(column.id)}
        onEdit={onEditColumn}
        onDelete={onDeleteColumn}
        onRestore={onRestoreColumn}
        onPermanentDelete={onPermanentDeleteColumn} // NEW
        onDuplicate={onDuplicateColumn}
        onToggleStatus={onToggleColumnStatus}
        onSelection={onColumnSelection}
        canManage={effectiveCanManageColumns}
        showSelection={showBulkActions}
      />
    ));
  }, [
    memoizedColumns, 
    categories, 
    selectedColumns, 
    onEditColumn, 
    onDeleteColumn, 
    onRestoreColumn, 
    onPermanentDeleteColumn, 
    onDuplicateColumn, 
    onToggleColumnStatus, 
    onColumnSelection, 
    canManageColumns, 
    // showBulkActions
  ]);

  // NOW SAFE TO USE CONDITIONAL RETURNS AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Sütunlar yüklənərkən xəta baş verdi</p>
      </div>
    );
  }

  if (memoizedColumns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Heç bir sütun tapılmadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {columnItems}
    </div>
  );
};

// Display name for debugging
EnhancedColumnList.displayName = 'EnhancedColumnList';

export default EnhancedColumnList;
