
import React from 'react';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarClock } from 'lucide-react';

interface CategoryHeaderProps {
  name: string;
  description?: string;
  deadline?: string;
  isSubmitted: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  name,
  description,
  deadline,
  isSubmitted
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {deadline && (
          <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
            <CalendarClock className="h-4 w-4 text-primary" />
            <span>{t('deadline')}:</span>
            <span className="font-medium">{format(new Date(deadline), 'dd.MM.yyyy')}</span>
          </div>
        )}
      </div>
      
      {isSubmitted && (
        <div className="text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 p-2 rounded-md mt-2">
          {t('formSubmitted')}
        </div>
      )}
    </div>
  );
};

export default CategoryHeader;
