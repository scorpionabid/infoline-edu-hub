import { useColumnsQuery } from './useColumnsQuery';
import { useColumnMutations } from './useColumnMutations';
import { useEffect } from 'react';

/**
 * Combined hook for columns operations - includes both querying and mutations
 */
export const useColumns = (categoryId?: string) => {
  // Debug üçün mesajlar əlavə edirik
  console.log('useColumns hook called with categoryId:', categoryId);
  
  // Get data fetching capabilities
  const columnsQuery = useColumnsQuery({ 
    categoryId, 
    enabled: true
  });
  
  const {
    data: columns = [],
    isLoading,
    isError,
    error,
    refetch
  } = columnsQuery;
  
  // Debug üçün useEffect əlavə edirik
  useEffect(() => {
    // Array olub-olmadığını yoxla və sonra length xüsusiyyətindən istifadə et
    const columnsCount = Array.isArray(columns) ? columns.length : 0;
    console.log('Columns loaded:', columnsCount, 'items');
    if (columnsCount === 0) {
      console.log('No columns found. This could be a data loading issue.');
    }
  }, [columns]);

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
