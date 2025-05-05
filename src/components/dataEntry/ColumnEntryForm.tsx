
import React from 'react';
import { Column } from '@/types/column';
import EntryField from './EntryField';
import { useLanguage } from '@/context/LanguageContext';

interface ColumnEntryFormProps {
  column: Column;
  value: string;
  onChange: (columnId: string, value: string) => void;
  error?: string;
  categoryId?: string;
}

const ColumnEntryForm: React.FC<ColumnEntryFormProps> = ({
  column,
  value,
  onChange,
  error,
  categoryId
}) => {
  const { t } = useLanguage();
  
  const handleValueChange = (newValue: string) => {
    onChange(column.id, newValue);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium">
          {column.name}
          {column.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {column.help_text && (
          <span className="text-xs text-muted-foreground">{column.help_text}</span>
        )}
      </div>
      
      <EntryField
        column={column}
        value={value}
        onChange={handleValueChange}
        error={error}
      />
    </div>
  );
};

export default ColumnEntryForm;
