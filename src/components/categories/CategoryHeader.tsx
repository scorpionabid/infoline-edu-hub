
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/LanguageContext';
import { Plus, UploadCloud, BarChart2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface CategoryHeaderProps {
  onAddClick: () => void;
  onImportClick?: () => void;
  onAnalyticsClick?: () => void;
  showImport?: boolean;
  showAnalytics?: boolean;
  title?: string;
  subtitle?: string;
}

export function CategoryHeader({
  onAddClick,
  onImportClick,
  onAnalyticsClick,
  showImport = true,
  showAnalytics = true,
  title,
  subtitle
}: CategoryHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <PageHeader 
        title={title || t('categories')} 
        subtitle={subtitle || t('categoriesDescription')} 
      />
      
      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
        {showAnalytics && onAnalyticsClick && (
          <Button variant="outline" onClick={onAnalyticsClick} className="flex items-center gap-2">
            <BarChart2 size={16} />
            {t('analytics')}
          </Button>
        )}
        
        {showImport && onImportClick && (
          <Button variant="outline" onClick={onImportClick} className="flex items-center gap-2">
            <UploadCloud size={16} />
            {t('import')}
          </Button>
        )}
        
        <Button onClick={onAddClick} className="flex items-center gap-2">
          <Plus size={16} />
          {t('addCategory')}
        </Button>
      </div>
    </div>
  );
}

export default CategoryHeader;
