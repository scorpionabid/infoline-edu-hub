
import { useState, useCallback, useMemo } from 'react';

export const useFiltering = <T extends Record<string, any>>(
  data: T[] = [],
  searchFields: string[] = []
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchFields.length === 0) {
      return data;
    }

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(query);
        }
        if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFields]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    // handleSearchChange
  };
};

export default useFiltering;
