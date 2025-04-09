
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ReportType } from '@/types/report';

interface ReportFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: ReportType | 'all';
  onTypeFilterChange: (value: ReportType | 'all') => void;
}

const ReportFilter: React.FC<ReportFilterProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchReports')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select
        value={typeFilter}
        onValueChange={(value) => onTypeFilterChange(value as ReportType | 'all')}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder={t('reportType')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allTypes')}</SelectItem>
          <SelectItem value="statistics">{t('statistics')}</SelectItem>
          <SelectItem value="completion">{t('completion')}</SelectItem>
          <SelectItem value="comparison">{t('comparison')}</SelectItem>
          <SelectItem value="column">{t('column')}</SelectItem>
          <SelectItem value="category">{t('category')}</SelectItem>
          <SelectItem value="school">{t('school')}</SelectItem>
          <SelectItem value="region">{t('region')}</SelectItem>
          <SelectItem value="sector">{t('sector')}</SelectItem>
          <SelectItem value="custom">{t('custom')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ReportFilter;
