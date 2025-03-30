
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw } from 'lucide-react';

interface RegionFiltersProps {
  t: (key: string) => string;
  searchTerm: string;
  selectedStatus: string | null;
  handleSearch: (term: string) => void;
  handleStatusFilter: (status: string | null) => void;
  resetFilters: () => void;
}

const RegionFilters: React.FC<RegionFiltersProps> = ({
  t,
  searchTerm,
  selectedStatus,
  handleSearch,
  handleStatusFilter,
  resetFilters,
}) => (
  <div className="flex justify-between items-center mb-4 space-x-4">
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t('searchRegions')}
        className="pl-8"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
    <Select 
      value={selectedStatus || "all"} 
      onValueChange={(value) => handleStatusFilter(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('allStatuses')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('allStatuses')}</SelectItem>
        <SelectItem value="active">{t('active')}</SelectItem>
        <SelectItem value="inactive">{t('inactive')}</SelectItem>
      </SelectContent>
    </Select>
    <Button 
      variant="outline" 
      onClick={resetFilters}
      disabled={!searchTerm && !selectedStatus}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      {t('resetFilters')}
    </Button>
  </div>
);

export default RegionFilters;
