import React, { useState, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { Column } from '@/types/column';
import FormFieldsEntry from './FormFieldsEntry';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryFormProps {
  category: CategoryWithColumns;
  onSubmit: (entries: any[]) => Promise<void>;
  initialEntries?: any[];
  loading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  initialEntries = [],
  loading = false,
}) => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState(initialEntries);
  const [isSaving, setIsSaving] = useState(false);

  // Əgər kategoriya columns-u undefined-dırsa, boş array təyin et
  const safeCategory = category.columns ? category : { ...category, columns: [] as Column[] };

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const handleSave = async (data: any[]) => {
    setIsSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <FormFieldsEntry 
        columns={safeCategory.columns || []}
        initialEntries={entries}
        onSave={handleSave}
        loading={isSaving}
        categoryId={category.id}
      />
    </div>
  );
};

export default CategoryForm;
