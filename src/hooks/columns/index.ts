
export { useColumnMutations } from './useColumnMutations';

// Add a hook for querying columns
export const useColumnsQuery = (options: { status?: string; enabled?: boolean } = {}) => {
  // Simple mock implementation for now
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: () => {}
  };
};
