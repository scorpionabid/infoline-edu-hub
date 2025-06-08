
import { useSectorDataEntryUnified, UseSectorDataEntryOptions } from './useSectorDataEntryUnified';

// Re-export with more descriptive name for sector-only data entry
export const useSectorOnlyDataEntry = (options: UseSectorDataEntryOptions) => {
  return useSectorDataEntryUnified(options);
};

export default useSectorOnlyDataEntry;
