
import React from 'react';
import { Column, CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import FormField from './components/FormField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryFormProps {
  category: CategoryWithColumns;
  entries: CategoryEntryData[];
  onEntriesChange: (categoryId: string, columnId: string, value: any) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, entries, onEntriesChange }) => {
  const { t } = useLanguage();
  
  // Bu kateqoriya üçün giriş məlumatlarını tap
  const categoryEntry = entries.find(e => e.categoryId === category.id);
  
  const getValue = (columnId: string) => {
    if (!categoryEntry) return null;
    const entry = categoryEntry.entries.find(e => e.columnId === columnId);
    return entry ? entry.value : null;
  };

  const handleValueChange = (columnId: string, value: any) => {
    onEntriesChange(category.id, columnId, value);
  };

  if (category.columns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            {t('noColumnsInCategory')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {category.columns.map((column) => (
        <FormField
          key={column.id}
          id={column.id}
          type={column.type}
          name={column.name}
          value={getValue(column.id)}
          onChange={(value) => handleValueChange(column.id, value)}
          placeholder={column.placeholder}
          helpText={column.help_text}
          options={column.options as { label: string; value: string }[]}
          validation={column.validation}
          isRequired={column.is_required}
        />
      ))}
    </div>
  );
};

export default CategoryForm;
