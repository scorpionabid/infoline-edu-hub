
import { useDataEntry } from '@/hooks/business/dataEntry/useDataEntry';

export const useSchoolDataEntry = (props: any) => {
  return useDataEntry(props);
};

export type UseSchoolDataEntryResult = ReturnType<typeof useSchoolDataEntry>;
