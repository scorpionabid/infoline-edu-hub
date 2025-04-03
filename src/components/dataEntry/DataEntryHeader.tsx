
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileDown, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';

interface DataEntryHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onExportData: () => void;
}

const DataEntryHeader: React.FC<DataEntryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onExportData
}) => {
  const { t } = useLanguage();
  const { categories, loading } = useCategories();

  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">{t('search')}</div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchDataEntries')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <div className="text-sm font-medium mb-2">{t('category')}</div>
          <Select 
            value={categoryFilter} 
            onValueChange={onCategoryFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {!loading && categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <div className="text-sm font-medium mb-2">{t('status')}</div>
          <Select 
            value={statusFilter} 
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 mr-2">{t('pending')}</Badge>
                  {t('pendingStatus')}
                </div>
              </SelectItem>
              <SelectItem value="approved">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-100 text-green-800 mr-2">{t('approved')}</Badge>
                  {t('approvedStatus')}
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-red-100 text-red-800 mr-2">{t('rejected')}</Badge>
                  {t('rejectedStatus')}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onExportData}
            className="whitespace-nowrap"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {t('exportData')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataEntryHeader;
