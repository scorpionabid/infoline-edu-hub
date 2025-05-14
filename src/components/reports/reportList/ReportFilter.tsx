
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { ReportTypeValues } from '@/types/report';

interface ReportFilterProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({
  filters,
  onFilterChange,
}) => {
  const { t } = useLanguage();

  // Filtrleri idarə etmək üçün handler funksiyalar
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('search', e.target.value);
  };

  const handleTypeChange = (value: string) => {
    onFilterChange('type', value);
  };

  const handleStatusChange = (value: string) => {
    onFilterChange('status', value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input
        placeholder={t('searchReports')}
        value={filters.search}
        onChange={handleSearchChange}
        className="md:w-64"
      />
      
      <div className="flex gap-4">
        <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("reportType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value={ReportTypeValues.BAR}>{t("statistics")}</SelectItem>
              <SelectItem value={ReportTypeValues.PIE}>{t("completion")}</SelectItem>
              <SelectItem value={ReportTypeValues.LINE}>{t("comparison")}</SelectItem>
              <SelectItem value={ReportTypeValues.TABLE}>{t("column")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="draft">{t("draft")}</SelectItem>
              <SelectItem value="published">{t("published")}</SelectItem>
              <SelectItem value="archived">{t("archived")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilter;
