
import { useState, useCallback } from 'react';
import { UserFilter } from '@/hooks/useUserList';

export const useUserFilters = () => {
  const [filter, setFilter] = useState<UserFilter>({});

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
  }, []);

  return {
    filter,
    updateFilter,
    resetFilter
  };
};
