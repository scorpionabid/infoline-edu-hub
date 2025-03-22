
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileDown, Filter, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReportHeader: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('reports')}</h1>
          <p className="text-muted-foreground">
            {t('reportsDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {t('filter')}
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('generateReport')}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder={t('searchReports')}
          className="md:max-w-sm"
        />
        <Select defaultValue="all">
          <SelectTrigger className="md:max-w-[180px]">
            <SelectValue placeholder={t('reportType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allReports')}</SelectItem>
            <SelectItem value="statistics">{t('statisticsReports')}</SelectItem>
            <SelectItem value="completion">{t('completionReports')}</SelectItem>
            <SelectItem value="comparison">{t('comparisonReports')}</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="md:max-w-[180px]">
            <SelectValue placeholder={t('timePeriod')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTime')}</SelectItem>
            <SelectItem value="today">{t('today')}</SelectItem>
            <SelectItem value="thisWeek">{t('thisWeek')}</SelectItem>
            <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
            <SelectItem value="last3Months">{t('last3Months')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportHeader;
