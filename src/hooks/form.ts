import { useState } from 'react';
import { CategoryEntryData } from '@/types/dataEntry';

export const useForm = () => {
  const [entries, setEntries] = useState<CategoryEntryData[]>([]);

  const updateEntryValue = (categoryId: string, columnId: string, value: any) => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.categoryId === categoryId) {
          return {
            ...entry,
            values: entry.values.map(val => {
              if (val.column_id === columnId) {
                return { ...val, value };
              }
              return val;
            })
          };
        }
        return entry;
      });
    });
  };

  return {
    entries,
    setEntries,
    updateEntryValue
  };
};
