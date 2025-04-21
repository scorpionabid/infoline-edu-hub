
import { useState, useCallback } from 'react';
import { UserFilter } from '../useUserList';

export const useUserFilters = () => {
  const defaultFilters: UserFilter = {
    role: undefined,
    status: undefined,
    region: undefined,
    sector: undefined,
    school: undefined,
    search: undefined
  };

  const [filter, setFilter] = useState<UserFilter>(defaultFilters);

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(defaultFilters);
  }, []);

  return { filter, updateFilter, resetFilter };
};
