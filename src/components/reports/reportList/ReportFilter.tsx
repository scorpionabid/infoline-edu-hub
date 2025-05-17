
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Search, X, Filter, BarChart, LineChart, PieChart, Table, LayoutGrid } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReportFilter as ReportFilterType } from '@/types/report';
import { REPORT_TYPE_VALUES } from '@/types/report';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface ReportFilterProps {
  filters: ReportFilterType;
  onFiltersChange: (filters: ReportFilterType) => void;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>(filters.type || []);
  const [searchValue, setSearchValue] = useState<string>(filters.search || '');
  
  // Define report types with icons
  const reportTypes = [
    { value: REPORT_TYPE_VALUES.BAR, label: t('barChart'), icon: <BarChart className="mr-2 h-4 w-4" /> },
    { value: REPORT_TYPE_VALUES.LINE, label: t('lineChart'), icon: <LineChart className="mr-2 h-4 w-4" /> },
    { value: REPORT_TYPE_VALUES.PIE, label: t('pieChart'), icon: <PieChart className="mr-2 h-4 w-4" /> },
    { value: REPORT_TYPE_VALUES.TABLE, label: t('tableReport'), icon: <Table className="mr-2 h-4 w-4" /> },
    { value: REPORT_TYPE_VALUES.METRICS, label: t('metricsReport'), icon: <LayoutGrid className="mr-2 h-4 w-4" /> }
  ];
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.target.value;
    setSearchValue(newSearchValue);
    onFiltersChange({ ...filters, search: newSearchValue });
  };

  const handleSelectType = (selectedType: string) => {
    const updatedValues = value.includes(selectedType) 
      ? value.filter(type => type !== selectedType) 
      : [...value, selectedType];
      
    setValue(updatedValues);
    onFiltersChange({ ...filters, type: updatedValues });
  };
  
  const handleClearFilters = () => {
    setValue([]);
    setSearchValue('');
    onFiltersChange({
      search: '',
      type: [],
      status: filters.status,
      date_from: filters.date_from,
      date_to: filters.date_to,
      shared_with: filters.shared_with,
      is_template: filters.is_template,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });
  };
  
  const hasActiveFilters = value.length > 0 || searchValue;
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
      <div className="relative w-full md:w-auto flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('searchReports')}
          className="pl-8 w-full"
          value={searchValue}
          onChange={handleSearch}
        />
      </div>
      
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4 mr-1" />
              {t('filter')}
              {value.length > 0 && (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal ml-1">
                  {value.length}
                </Badge>
              )}
              <ChevronsUpDown className="h-3 w-3 opacity-50 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <Command>
              <CommandInput placeholder={t('filterByType')} />
              <CommandList>
                <CommandEmpty>{t('noResultsFound')}</CommandEmpty>
                <CommandGroup>
                  {reportTypes.map((type) => (
                    <CommandItem
                      key={type.value}
                      onSelect={() => handleSelectType(type.value)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          value.includes(type.value) ? "bg-primary border-primary" : "opacity-50"
                        )}
                      >
                        {value.includes(type.value) && (
                          <Check className={cn("h-3 w-3 text-primary-foreground")} />
                        )}
                      </div>
                      {type.icon}
                      <span>{type.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {hasActiveFilters && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleClearFilters}
                        className="justify-center text-center"
                      >
                        {t('clearFilters')}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearFilters}
            title={t('clearFilters')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
