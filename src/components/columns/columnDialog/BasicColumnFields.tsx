
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ColumnType, Column, BasicColumnFieldsProps } from '@/types/column';
import { ColumnTypeSelector } from './ColumnTypeSelector';
import { useLanguage } from '@/context/LanguageContext';

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  control,
  categories,
  columns,
  editColumn,
  selectedType,
  onTypeChange,
  isEditMode
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('columnName')}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t('category')}</FormLabel>
              <Select
                disabled={isEditMode}
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
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
      </div>
      
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fieldType')}</FormLabel>
            <FormControl>
              <ColumnTypeSelector 
                value={selectedType} 
                onValueChange={(type) => {
                  field.onChange(type);
                  onTypeChange(type);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="help_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('helpText')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('placeholder')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t('required')}</FormLabel>
              <p className="text-sm text-muted-foreground">
                {t('requiredFieldDescription')}
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
