
// Mock hook for test compatibility
import { useQuery } from '@tanstack/react-query';

export const useApprovalDataQuery = () => {
  return useQuery({
    queryKey: ['approval-data'],
    queryFn: () => Promise.resolve([]),
    enabled: false
  });
};

export default useApprovalDataQuery;
