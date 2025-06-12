// =============================================================================
// DEPRECATED - USE '@/hooks/columns' INSTEAD
// =============================================================================

console.warn(`
⚠️  DEPRECATED IMPORT DETECTED ⚠️
The import '@/hooks/columns/useColumns' is deprecated.
Please update to: import { useColumnsQuery, useColumnMutations } from '@/hooks/columns'

Migration example:
OLD:
  const { columns, createColumn, updateColumn } = useColumns();
  
NEW:
  const { data: columns } = useColumnsQuery({ categoryId });
  const { createColumn, updateColumn } = useColumnMutations();
`);

// Create a compatibility wrapper that combines query + mutations
import { useColumnsQuery } from './core/useColumnsQuery';
import { useColumnMutations } from './mutations/useColumnMutations';

export const useColumns = (categoryId?: string) => {
  const { data: columns = [], isLoading, error, refetch } = useColumnsQuery({ categoryId });
  const mutations = useColumnMutations();
  
  return {
    // Data
    columns,
    loading: isLoading, // Legacy name
    isLoading,
    error,
    refetch,
    
    // Mutations (wrapped for compatibility)
    createColumn: (data: any) => mutations.createColumn({ categoryId: categoryId!, data }),
    updateColumn: (columnId: string, data: any) => mutations.updateColumn({ columnId, data }),
    deleteColumn: (columnId: string) => mutations.deleteColumn({ columnId }),
    
    // Loading states
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting
  };
};

export default useColumns;
