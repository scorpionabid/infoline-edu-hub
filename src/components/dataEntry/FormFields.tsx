
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns, EntryValue } from '@/types/dataEntry';
import { Separator } from '@/components/ui/separator';
import TextInput from './inputs/TextInput';
import NumberInput from './inputs/NumberInput';
import SelectInput from './inputs/SelectInput';
import DateInput from './inputs/DateInput';
import CheckboxInput from './inputs/CheckboxInput';

interface FormFieldsProps {
  category: CategoryWithColumns;
  entries: EntryValue[];
  onChange: (entries: EntryValue[]) => void;
  disabled?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  category,
  entries,
  onChange,
  disabled = false
}) => {
  const { t } = useLanguage();

  const handleEntryChange = (entry: EntryValue) => {
    // Eyni sütun üçün mövcud giriş axtarırıq
    const existingEntryIndex = entries.findIndex(
      (e) => e.column_id === entry.column_id
    );

    // Yeni entries yaradırıq
    let updatedEntries: EntryValue[];

    if (existingEntryIndex >= 0) {
      // Mövcud girişi yeniləyirik
      updatedEntries = [...entries];
      updatedEntries[existingEntryIndex] = {
        ...updatedEntries[existingEntryIndex],
        value: entry.value
      };
    } else {
      // Yeni giriş əlavə edirik
      updatedEntries = [...entries, entry];
    }

    onChange(updatedEntries);
  };

  // Sütun üçün dəyəri tapan metod
  const getEntryValue = (columnId: string) => {
    const entry = entries.find((e) => e.column_id === columnId);
    return entry ? entry.value : '';
  };

  if (!category || !category.columns || category.columns.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('noColumnsInCategory')}
      </div>
    );
  }

  // Sütunları order_index-ə görə sıralayırıq
  const sortedColumns = [...category.columns].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  return (
    <div className="space-y-6">
      {sortedColumns.map((column) => {
        const entry = {
          column_id: column.id,
          category_id: category.id,
          school_id: '', // Bu dəyər useDataEntry hook-da məktəb ID-si ilə əvəz olunacaq
          value: getEntryValue(column.id)
        };

        const commonProps = {
          key: column.id,
          column: column,
          value: entry.value,
          onChange: (value: any) => handleEntryChange({ ...entry, value }),
          disabled: disabled
        };

        switch (column.type) {
          case 'text':
          case 'textarea':
            return <TextInput {...commonProps} />;
          case 'number':
            return <NumberInput {...commonProps} />;
          case 'select':
            return <SelectInput {...commonProps} />;
          case 'date':
            return <DateInput {...commonProps} />;
          case 'checkbox':
            return <CheckboxInput {...commonProps} />;
          default:
            return <TextInput {...commonProps} />;
        }
      })}
    </div>
  );
};

export default FormFields;
