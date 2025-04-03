
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Column } from "@/types/column";
import { ColumnFormValues } from './useColumnForm';
import { useLanguage } from '@/context/LanguageContext';

export interface BasicColumnFieldsProps {
  form: UseFormReturn<ColumnFormValues>;
  categories: { id: string; name: string }[];
  columns: Column[];
  editColumn: Column | null;
  selectedType: string;
  handleTypeChange: (value: string) => void;
  categoryId?: string;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  categories,
  columns,
  editColumn,
  selectedType,
  handleTypeChange,
  categoryId = ''
}) => {
  const { t } = useLanguage();

  const columnTypes = [
    { value: "text", label: t('text') },
    { value: "number", label: t('number') },
    { value: "date", label: t('date') },
    { value: "select", label: t('select') },
    { value: "checkbox", label: t('checkbox') },
    { value: "radio", label: t('radio') },
    { value: "textarea", label: t('textarea') },
    { value: "email", label: t('email') },
    { value: "phone", label: t('phone') }
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('columnName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('enterColumnName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('category')}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || categoryId}
              disabled={!!categoryId}
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

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('columnType')}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleTypeChange(value);
              }}
              value={field.value}
              disabled={!!editColumn}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {columnTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isRequired"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <FormLabel>{t('isRequired')}</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('placeholder')}</FormLabel>
            <FormControl>
              <Input placeholder={t('enterPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="helpText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('helpText')}</FormLabel>
            <FormControl>
              <Input placeholder={t('enterHelpText')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="order"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('orderNumber')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicColumnFields;
