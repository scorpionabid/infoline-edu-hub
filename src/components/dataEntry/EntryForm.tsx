
import React from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CategoryWithColumns } from '@/types/column';
import { TextInput } from './inputs/TextInput';
import { NumberInput } from './inputs/NumberInput';
import { EntryFormData } from '@/types/entry';
import { DataEntry } from '@/types/dataEntry';

interface EntryFormProps {
  category: CategoryWithColumns;
  entries: DataEntry[];
  onChange: (entries: DataEntry[]) => void;
  disabled?: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  category,
  entries,
  onChange,
  disabled
}) => {
  const form = useForm({
    defaultValues: {
      fields: entries.reduce((acc, entry) => ({
        ...acc,
        [entry.column_id]: entry.value
      }), {})
    }
  });

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values.fields) return;

      const newEntries = Object.entries(values.fields).map(([columnId, value]) => ({
        column_id: columnId,
        category_id: category.id,
        value: value as string,
        status: 'pending'
      }));

      onChange(newEntries);
    });

    return () => subscription.unsubscribe();
  }, [form, category.id, onChange]);

  const renderInput = (column: Column) => {
    switch (column.type) {
      case 'number':
        return <NumberInput key={column.id} column={column} disabled={disabled} />;
      default:
        return <TextInput key={column.id} column={column} disabled={disabled} />;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.columns.map(column => renderInput(column))}
        </div>
      </form>
    </Form>
  );
};
