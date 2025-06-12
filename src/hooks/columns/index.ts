// =============================================================================
// INFOLINE COLUMN HOOKS - UNIFIED API
// =============================================================================
// This file exports the unified column management API.
// All legacy hooks have been cleaned up and consolidated.

// Core Query Hooks
export { 
  useColumnsQuery,
  useActiveColumnsQuery, 
  useArchivedColumnsQuery,
  useColumnQuery,
  type ColumnsQueryOptions
} from './core/useColumnsQuery';

// Mutation Hooks  
export { 
  useColumnMutations 
} from './mutations/useColumnMutations';

// Enhanced Management Hook
export { useColumnManagement } from './useColumnManagement';

// Utility Hooks
export { useColumnActions } from './useColumnActions';
export { useColumnAdapters } from './useColumnAdapters';
export { updateCategoryColumnCount } from './useColumnCounter';
export { useColumnFilters } from './useColumnFilters';
export { useColumnForm } from './useColumnForm';

// =============================================================================
// API USAGE GUIDE
// =============================================================================
/*

UNIFIED API STRUCTURE:
```typescript
import { useColumnsQuery, useColumnMutations } from '@/hooks/columns';

// Query columns with various options
const { data: columns, isLoading, error, refetch } = useColumnsQuery({ 
  categoryId,
  status: 'active',
  includeDeleted: false
});

// Perform mutations
const { 
  createColumn, 
  updateColumn, 
  deleteColumn, 
  restoreColumn,
  isCreating,
  isUpdating,
  isDeleting
} = useColumnMutations();

// Specialized queries
const { data: activeColumns } = useActiveColumnsQuery(categoryId);
const { data: archivedColumns } = useArchivedColumnsQuery(categoryId);
```

KEY FEATURES:
- ✅ Unified API across all column operations
- ✅ TypeScript support with proper type inference
- ✅ Consistent loading and error states
- ✅ Automatic cache invalidation
- ✅ Optimistic updates for better UX
- ✅ Built-in soft delete and restore functionality

*/

// =============================================================================
// EXAMPLES
// =============================================================================
/*

// Basic Usage:
const MyComponent = () => {
  const { data: columns, isLoading, error } = useColumnsQuery({ 
    categoryId: 'abc123',
    status: 'active' 
  });
  
  const { createColumn, updateColumn, isCreating } = useColumnMutations();
  
  const handleCreate = async () => {
    await createColumn({
      categoryId: 'abc123',
      data: {
        name: 'New Column',
        type: 'text',
        is_required: false
      }
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {columns?.map(column => (
        <div key={column.id}>{column.name}</div>
      ))}
      <button onClick={handleCreate} disabled={isCreating}>
        Create Column
      </button>
    </div>
  );
};

// Advanced Usage with Optimistic Updates:
const AdvancedComponent = () => {
  const { data: columns } = useColumnsQuery({ categoryId: 'abc123' });
  const { updateColumnAsync } = useColumnMutations();
  
  const handleQuickEdit = async (columnId: string, newName: string) => {
    try {
      await updateColumnAsync({
        columnId,
        data: { name: newName }
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  
  return (
    <div>
      {columns?.map(column => (
        <EditableColumnName 
          key={column.id}
          column={column}
          onSave={(name) => handleQuickEdit(column.id, name)}
        />
      ))}
    </div>
  );
};

*/
