
import { useSectorDataEntry } from './sector/useSectorDataEntry';

export const useSectorOnlyDataEntry = (props: any) => {
  return useSectorDataEntry(props);
};

export type UseSectorOnlyDataEntryResult = ReturnType<typeof useSectorOnlyDataEntry>;
