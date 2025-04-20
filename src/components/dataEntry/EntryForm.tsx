
import React from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CategoryWithColumns } from '@/types/column';
import { TextInput } from './inputs/TextInput';
import { NumberInput } from './inputs/NumberInput';
import { EntryFormData, DataEntry } from '@/types/entry';

interface EntryFormProps {
  category: CategoryWithColumns;
  entries: DataEntry[];
  onChange: (entries: DataEntry[]) => void;
  disabled?: boolean;
  schoolId: string;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  category,
  entries,
  onChange,
  disabled,
  schoolId
}) => {
  const form = useForm<EntryFormData>({
    defaultValues: {
      entries: entries
    }
  });

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values.entries) return;

      const newEntries = Object.entries(values.entries).map(([columnId, value]) => ({
        column_id: columnId,
        school_id: schoolId,
        category_id: category.id,
        value: value as string,
        status: 'pending' as const
      }));

      onChange(newEntries);
    });

    return () => subscription.unsubscribe();
  }, [form, category.id, onChange, schoolId]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.columns?.map((column) => (
            column.type === 'number' ? (
              <NumberInput key={column.id} column={column} disabled={disabled} />
            ) : (
              <TextInput key={column.id} column={column} disabled={disabled} />
            )
          ))}
        </div>
      </form>
    </Form>
  );
};
