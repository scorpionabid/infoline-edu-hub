
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportFilter as ReportFilterType } from '@/types/report';

interface ReportFilterProps {
  filter: ReportFilterType;
  onFilterChange: (filter: ReportFilterType) => void;
}

const ReportFilter: React.FC<ReportFilterProps> = ({ filter, onFilterChange }) => {
  const handleStatusChange = (status: string[]) => {
    onFilterChange({ ...filter, status });
  };

  const handleTypeChange = (type: string[]) => {
    onFilterChange({ ...filter, type });
  };

  const handleDateFromChange = (date_from: string) => {
    onFilterChange({ ...filter, date_from });
  };

  const handleDateToChange = (date_to: string) => {
    onFilterChange({ ...filter, date_to });
  };

  const handleSortByChange = (sortBy: string) => {
    onFilterChange({ ...filter, sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFilterChange({ ...filter, sortOrder });
  };

  const resetFilters = () => {
    onFilterChange({
      status: [],
      type: [],
      created_by: [],
      date_from: '',
      date_to: '',
      shared_with: [],
      is_template: false,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select onValueChange={(value) => handleStatusChange([value])}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <Select onValueChange={(value) => handleTypeChange([value])}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All types</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="table">Table</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">From Date</label>
          <Input
            type="date"
            value={filter.date_from || ''}
            onChange={(e) => handleDateFromChange(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">To Date</label>
          <Input
            type="date"
            value={filter.date_to || ''}
            onChange={(e) => handleDateToChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <Select value={filter.sortBy || 'created_at'} onValueChange={handleSortByChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="updated_at">Updated Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Order</label>
          <Select value={filter.sortOrder || 'desc'} onValueChange={handleSortOrderChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReportFilter;
