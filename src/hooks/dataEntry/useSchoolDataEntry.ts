
import { useUnifiedDataEntry, UseUnifiedDataEntryOptions } from './useUnifiedDataEntry';

export interface UseSchoolDataEntryOptions extends Omit<UseUnifiedDataEntryOptions, 'entityType'> {
  schoolId: string;
}

export const useSchoolDataEntry = (options: UseSchoolDataEntryOptions) => {
  return useUnifiedDataEntry({
    ...options,
    entityId: options.schoolId,
    entityType: 'school'
  });
};

export default useSchoolDataEntry;
