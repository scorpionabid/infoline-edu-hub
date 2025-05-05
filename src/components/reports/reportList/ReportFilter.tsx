
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ReportType } from '@/types/report';
import { useLanguage } from '@/context/LanguageContext';

interface ReportFilterProps {
  search: string;
  type: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({ 
  search, 
  type, 
  onSearchChange,
  onTypeChange 
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-[350px]">
        <Input
          placeholder={t('searchReports')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full md:w-[200px]">
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('reportType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value={ReportType.STATISTICS.toString() || 'statistics'}>{t('statistics')}</SelectItem>
            <SelectItem value={ReportType.COMPLETION.toString() || 'completion'}>{t('completion')}</SelectItem>
            <SelectItem value={ReportType.COMPARISON.toString() || 'comparison'}>{t('comparison')}</SelectItem>
            <SelectItem value={ReportType.COLUMN.toString() || 'column'}>{t('column')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilter;
