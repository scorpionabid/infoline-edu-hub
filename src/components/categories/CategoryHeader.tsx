
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface CategoryHeaderProps {
  onAddClick: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ onAddClick }) => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">{t('categories')}</h2>
        <p className="text-muted-foreground">{t('manageCategoriesDescription')}</p>
      </div>
      <Button onClick={onAddClick} className="gap-1">
        <Plus className="h-4 w-4" />
        {t('addCategory')}
      </Button>
    </div>
  );
};

export default CategoryHeader;
