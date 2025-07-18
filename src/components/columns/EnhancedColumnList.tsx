import React, { useCallback, useMemo } from 'react';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';
import { 
  RotateCcw, 
  MoreHorizontal, 
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff
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
  onPermanentDeleteColumn?: (id: string) => void; 
  onDuplicateColumn?: (column: Column) => void;
  onToggleColumnStatus?: (id: string, status: 'active' | 'inactive' | 'deleted') => void;
  // onUpdateStatus is kept for backward compatibility but marked as deprecated
  // Use onToggleColumnStatus instead
  onUpdateStatus?: (id: string, status: 'active' | 'inactive' | 'deleted') => void;
  onColumnSelection?: (columnId: string) => void;
  // onReorderColumns is kept for future drag-and-drop implementation
  onReorderColumns?: (reorderedColumns: Column[]) => void;
  canManageColumns?: boolean;
  enableDragDrop?: boolean;
  showBulkActions?: boolean;
}

interface ColumnItemProps {
  column: Column;
  categories?: Category[];
  isSelected?: boolean;
  onEdit?: (column: Column) => void;
  // onDelete is kept for backward compatibility
  onDelete?: (id: string, name: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void; 
  onDuplicate?: (column: Column) => void;
  // onToggleStatus is kept for backward compatibility
  onToggleStatus?: (id: string, status: 'active' | 'inactive' | 'deleted') => void;
  // onSelection is kept for future row selection implementation
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
  onRestore,
  onPermanentDelete, // NEW
  onDuplicate,
  onToggleStatus,
  onSelection,
  canManage,
  showSelection
}) => {
  const getCategoryName = useCallback((categoryId: string) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Naməlum kateqoriya';
  }, [categories]);

  const getStatusColor = useCallback((status: string) => {
    const statusValue = status as 'active' | 'inactive' | 'deleted';
    switch (statusValue) {
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

  const status = column.status as 'active' | 'inactive' | 'deleted';
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg transition-all",
        isSelected && "ring-2 ring-primary bg-primary/5",
        status === 'deleted' ? "bg-amber-50 border-amber-200" : 
        status === 'inactive' ? "bg-gray-50 border-gray-200" : ""
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
            <Badge className={cn("text-xs", getStatusColor(column.status))}>
              {column.status === 'active' ? 'Aktiv' : 
               (column.status as string) === 'inactive' ? 'Deaktiv' : 
               (column.status as string) === 'deleted' ? 'Silinmiş' : 'Naməlum'}
            </Badge>
            {column.is_required && (
              <Badge variant="secondary" className="text-xs">
                Məcburi
              </Badge>
            )}
          </div>
          
          {/* Column Name - Main Title */}
          <h4 className="text-base font-semibold text-foreground mb-1">
            {column.name}
          </h4>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Kateqoriya: {getCategoryName(column.category_id)}</span>
            <span>Tip: {column.type}</span>
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
        {((column.status as string) === 'deleted' || column.status === 'inactive') ? (
          // Actions for deleted/inactive columns (archived)
          <div className="flex items-center space-x-2">
            {onRestore && canManage && (
              <button 
                onClick={() => onRestore(column.id)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Bərpa et
              </button>
            )}
            {onPermanentDelete && canManage && ((column.status as string) === 'deleted' || column.status === 'inactive') && (
              <button 
                onClick={() => onPermanentDelete(column.id)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Təmamən sil
              </button>
            )}
          </div>
        ) : (
          // Action buttons for active columns
          <div className="flex items-center space-x-1">
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => {
                      console.log('Edit clicked for column:', column.name, column.id);
                      onEdit(column);
                    }}>
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
const EnhancedColumnList: React.FC<EnhancedColumnListProps> = (props) => {
  const { 
    columns, 
    categories,
    isLoading, 
    isError, 
    selectedColumns = [],
    onEditColumn, 
    onDeleteColumn,
    onRestoreColumn,
    onPermanentDeleteColumn,
    onDuplicateColumn,
    onToggleColumnStatus,
    onColumnSelection,
    canManageColumns = false,
    showBulkActions = true,
    // These props are kept for backward compatibility but not used directly
    onUpdateStatus: _onUpdateStatus,
    onReorderColumns: _onReorderColumns,
    enableDragDrop: _enableDragDrop = false
  } = props;

  // Get user role to check if user is sectoradmin
  const role = selectUserRole(useAuthStore());
  const isSectorAdmin = role === 'sectoradmin';
  
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
