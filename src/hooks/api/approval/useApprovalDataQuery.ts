
import { useQuery } from '@tanstack/react-query';

export const useApprovalDataQuery = () => {
  return useQuery({
    queryKey: ['approval-data'],
    queryFn: () => Promise.resolve([]),
    enabled: false,
    select: (data) => ({
      data,
      approveEntry: async () => {},
      rejectEntry: async () => {},
      returnEntry: async () => {},
      filterByStatus: () => [],
      bulkApprove: async () => {}
    })
  });
};

export default useApprovalDataQuery;
