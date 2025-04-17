import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CategoryEntryData } from '@/types/dataEntry';

export const useDataUpdates = () => {
  const { toast } = useToast();

  const handleEntryChange = useCallback(
    (
      entries: CategoryEntryData[],
      categoryId: string,
      columnId: string,
      value: any
    ): CategoryEntryData[] => {
      return entries.map((entry) => {
        if (entry.categoryId === categoryId) {
          const updatedValues = entry.values.map((val) => {
            if (val.column_id === columnId) {
              return { ...val, value: value };
            }
            return val;
          });

          return {
            ...entry,
            values: updatedValues,
          };
        }
        return entry;
      });
    },
    []
  );

  const handleEntrySubmit = useCallback(
    (entries: CategoryEntryData[], categoryId: string): CategoryEntryData[] => {
      return entries.map((entry) => {
        if (entry.categoryId === categoryId) {
          return {
            ...entry,
            isSubmitted: true,
          };
        }
        return entry;
      });
    },
    []
  );

  const handleEntryApproval = useCallback(
    (entries: CategoryEntryData[], categoryId: string): CategoryEntryData[] => {
      return entries.map((entry) => {
        if (entry.categoryId === categoryId) {
          return {
            ...entry,
            approvalStatus: 'approved',
          };
        }
        return entry;
      });
    },
    []
  );

  const handleEntryRejection = useCallback(
    (entries: CategoryEntryData[], categoryId: string): CategoryEntryData[] => {
      return entries.map((entry) => {
        if (entry.categoryId === categoryId) {
          return {
            ...entry,
            approvalStatus: 'rejected',
          };
        }
        return entry;
      });
    },
    []
  );

  return {
    handleEntryChange,
    handleEntrySubmit,
    handleEntryApproval,
    handleEntryRejection,
  };
};
