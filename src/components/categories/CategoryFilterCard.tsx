
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { CategoryFilter } from '@/types/category';

export interface CategoryFilterCardProps {
  filter: CategoryFilter;
  onFilterChange: (newFilter: CategoryFilter) => void;
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  filter,
  onFilterChange
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };
  
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filter, status: value as CategoryFilter['status'] });
  };
  
  const handleAssignmentChange = (value: string) => {
    onFilterChange({ ...filter, assignment: value as 'all' | 'sectors' | '' });
  };
  
  const handleDeadlineChange = (value: string) => {
    onFilterChange({ ...filter, deadline: value as 'upcoming' | 'past' | 'all' | '' });
  };
  
  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      assignment: '',
      deadline: ''
    });
  };
  
  const hasActiveFilters = 
    !!filter.search || 
    filter.status !== 'all' || 
    !!filter.assignment || 
    !!filter.deadline;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Axtar..."
              className="pl-8"
              value={filter.search || ''}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select 
            value={filter.status || 'all'} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün statuslar</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Deaktiv</SelectItem>
              <SelectItem value="draft">Qaralama</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filter.assignment || ''} 
            onValueChange={handleAssignmentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Təyinat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Bütün təyinatlar</SelectItem>
              <SelectItem value="all">Hamısı</SelectItem>
              <SelectItem value="sectors">Sektorlar</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filter.deadline || ''} 
            onValueChange={handleDeadlineChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Son tarix" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Bütün tarixlər</SelectItem>
              <SelectItem value="upcoming">Gələcək</SelectItem>
              <SelectItem value="past">Keçmiş</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <div className="md:col-span-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Filtirləri təmizlə
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
