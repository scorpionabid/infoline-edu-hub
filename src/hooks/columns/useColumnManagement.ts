
import { useColumnsQuery } from './index';
import { useColumnMutations } from './useColumnMutations';

export const useColumnManagement = () => {
  const { data: columns, isLoading, error, refetch } = useColumnsQuery({ 
    status: 'active', 
    enabled: true 
  });
  
  const mutations = useColumnMutations();

  return {
    columns: columns || [],
    loading: isLoading,
    error,
    refetch,
    ...mutations,
    // Missing methods - placeholder implementations
    reorderColumns: () => {
      console.warn('reorderColumns not implemented yet');
    },
    reorderColumnsAsync: async () => {
      console.warn('reorderColumnsAsync not implemented yet');
    },
    isReordering: false,
  };
};
