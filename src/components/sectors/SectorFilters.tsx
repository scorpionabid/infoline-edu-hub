
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SectorFiltersProps {
  searchTerm: string;
  selectedStatus: string | null;
  onSearch: (term: string) => void;
  onStatusFilter: (status: string | null) => void;
}

const SectorFilters: React.FC<SectorFiltersProps> = ({ 
  searchTerm, 
  selectedStatus, 
  onSearch, 
  onStatusFilter 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between items-center mb-4 gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={t('searchSectors')}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Select
        value={selectedStatus || 'all'}
        onValueChange={(value) => onStatusFilter(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allStatuses')}</SelectItem>
          <SelectItem value="active">{t('active')}</SelectItem>
          <SelectItem value="inactive">{t('inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SectorFilters;
