
import { useUnifiedDataEntry, UseUnifiedDataEntryOptions } from './useUnifiedDataEntry';

export interface UseSectorDataEntryOptions extends Omit<UseUnifiedDataEntryOptions, 'entityType'> {
  sectorId: string;
}

export const useSectorDataEntryUnified = (options: UseSectorDataEntryOptions) => {
  return useUnifiedDataEntry({
    ...options,
    entityId: options.sectorId,
    entityType: 'sector'
  });
};

export default useSectorDataEntryUnified;
