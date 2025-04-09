
import { useState, useCallback } from 'react';
import { CategoryFilter } from '@/types/category';
import { DateRange } from 'react-day-picker';

export const useCategoryFilters = () => {
  const [filter, setFilter] = useState<CategoryFilter>({
    status: 'all',
    assignment: 'all',
    deadline: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleFilterChange = useCallback((newFilter: Partial<CategoryFilter>) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDateChange = useCallback((newDate: DateRange | undefined) => {
    setDate(newDate);
  }, []);

  return {
    filter,
    handleFilterChange,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    date,
    setDate,
    handleDateChange
  };
};
