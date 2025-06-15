
import { useColumnMutations } from './useColumnMutations';

export const useColumnForm = () => {
  const mutations = useColumnMutations();
  
  return {
    ...mutations,
    // Legacy compatibility
    createColumnAsync: mutations.createColumn.mutateAsync,
    updateColumnAsync: mutations.updateColumn.mutateAsync,
    isCreating: mutations.createColumn.isPending,
    isUpdating: mutations.updateColumn.isPending,
  };
};
