
import React from 'react';
import { UseFormReturn, Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/category';
import { ColumnType } from '@/types/column';

interface BasicColumnFieldsProps {
  form: UseFormReturn<any>;
  control: Control<any>;
  errors: any;
  watch: any;
  categories: Category[];
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}

const columnTypes = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'select', label: 'Select', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio', icon: '🔘' },
  { value: 'textarea', label: 'Textarea', icon: '📄' }
];

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  control,
  errors,
  watch,
  categories,
  selectedType,
  onTypeChange,
  // isEditMode
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sütun Adı *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Sütun adını daxil edin" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kateqoriya *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tip *</FormLabel>
            <Select onValueChange={(value) => {
              field.onChange(value);
              onTypeChange(value as ColumnType);
            }} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sütun tipini seçin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {columnTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıqlama</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Sütun açıqlaması" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
