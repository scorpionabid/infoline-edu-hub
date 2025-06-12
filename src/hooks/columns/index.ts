// =============================================================================
// INFOLINE COLUMN HOOKS - UNIFIED API
// =============================================================================
// This file exports the new unified column management API.
// Legacy hooks are being phased out in favor of this consolidated approach.

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

// Legacy Hooks (DEPRECATED - will be removed in next version)
// These are kept for backward compatibility during migration period
export { useColumnActions } from './useColumnActions';
export { useColumnAdapters } from './useColumnAdapters';
export { updateCategoryColumnCount } from './useColumnCounter'; // function, not hook
export { useColumnFilters } from './useColumnFilters';
export { useColumnForm } from './useColumnForm';

// =============================================================================
// MIGRATION GUIDE
// =============================================================================
/*

OLD API (DEPRECATED):
```typescript
import { useColumnsQuery } from '@/hooks/columns/useColumnsQuery';
import { useColumnsNew } from '@/hooks/columns/useColumnsNew';
import { useColumns } from '@/hooks/columns/useColumns';
import { useColumnMutations } from '@/hooks/columns/useColumnMutations';

// Multiple different APIs with inconsistent interfaces
const { columns, loading } = useColumnsQuery({ categoryId });
const { createColumn } = useColumns();
const { updateColumn } = useColumnMutations();
```

NEW API (RECOMMENDED):
```typescript
import { useColumnsQuery, useColumnMutations } from '@/hooks/columns';

// Single, consistent API
const { data: columns, isLoading } = useColumnsQuery({ categoryId });
const { createColumn, updateColumn, deleteColumn } = useColumnMutations();

// Specialized queries
const { data: activeColumns } = useActiveColumnsQuery(categoryId);
const { data: archivedColumns } = useArchivedColumnsQuery(categoryId);
```

BENEFITS:
- ✅ Unified API across all column operations
- ✅ Better TypeScript support
- ✅ Consistent loading states
- ✅ Proper error handling
- ✅ Optimistic updates
- ✅ Automatic cache invalidation
- ✅ Better performance

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
