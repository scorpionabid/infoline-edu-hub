
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryHeaderProps {
  name: string;
  description?: string;
  deadline?: string;
  onSaveCategory?: () => void;
  isSubmitted: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  name,
  description,
  deadline,
  onSaveCategory,
  isSubmitted
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h3 className="text-lg font-medium">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {deadline && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span>{t('deadline')}:</span>
            <span className="font-medium">{format(new Date(deadline), 'dd.MM.yyyy')}</span>
          </div>
        )}
        
        {onSaveCategory && !isSubmitted && (
          <Button variant="outline" size="sm" onClick={onSaveCategory} className="ml-2">
            <Save className="h-4 w-4 mr-2" />
            {t('saveCategory')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;
