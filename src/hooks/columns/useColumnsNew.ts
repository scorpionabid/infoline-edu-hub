import { useColumnsQuery } from './useColumnsQuery';
import { useColumnMutations } from './useColumnMutations';

/**
 * Combined hook for columns operations - includes both querying and mutations
 */
export const useColumns = (categoryId?: string) => {
  // Get data fetching capabilities
  const {
    data: columns = [],
    isLoading,
    isError,
    error,
    refetch
  } = useColumnsQuery({ 
    categoryId, 
    enabled: true
  });

  // Get mutation capabilities
  const columnMutations = useColumnMutations();

  // Return combined API
  return {
    // Data and query state
    columns,
    isLoading,
    isError,
    error,
    refetch,
    
    // Mutation methods
    createColumn: columnMutations.createColumn,
    updateColumn: columnMutations.updateColumn,
    deleteColumn: columnMutations.deleteColumn,
    
    // Legacy properties for backward compatibility
    loading: isLoading
  };
};

export default useColumns;
