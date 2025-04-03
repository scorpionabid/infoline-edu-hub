
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface CategoryHeaderProps {
  onAddCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ onAddCategory }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <h1 className="text-2xl font-bold tracking-tight">{t('categories')}</h1>
      <Button onClick={onAddCategory}>
        <Plus className="mr-2 h-4 w-4" /> {t('addCategory')}
      </Button>
    </div>
  );
};

export default CategoryHeader;
