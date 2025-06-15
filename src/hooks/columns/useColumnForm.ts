
import { useColumnMutations } from './useColumnMutations';

export const useColumnForm = () => {
  const mutations = useColumnMutations();
  
  return {
    ...mutations,
    // Legacy compatibility with proper property access
    createColumnAsync: mutations.createColumnAsync,
    updateColumnAsync: mutations.updateColumnAsync,
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
  };
};
