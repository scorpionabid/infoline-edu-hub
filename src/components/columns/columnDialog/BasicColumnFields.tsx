
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Column, ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Control } from 'react-hook-form';
import ColumnTypeSelector from './ColumnTypeSelector';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface BasicColumnFieldsProps {
  form: any;
  control: Control<any>;
  categories: { id: string; name: string }[];
  columns?: Column[];
  editColumn?: Column | null;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  control,
  categories,
  columns = [],
  editColumn,
  selectedType,
  onTypeChange,
  isEditMode
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Kateqoriya seçimi */}
      <FormField
        control={control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("categoryLabel")}</FormLabel>
            <Select 
              disabled={isEditMode}
              defaultValue={editColumn?.category_id || undefined}
              onValueChange={field.onChange} 
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category, index) => {
                  // Ensure category.id is never an empty string
                  const categoryId = category.id || `category-${index}-${Math.random().toString(36).slice(2)}`;
                  
                  return (
                    <SelectItem key={categoryId} value={categoryId}>
                      {category.name || `Category ${index + 1}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sütun adı */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnNameLabel")}</FormLabel>
            <FormControl>
              <Input placeholder={t("columnNamePlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sütun təsviri */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("descriptionLabel")}</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={t("descriptionPlaceholder")} 
                className="min-h-[80px]" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sütun tipi */}
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnTypeLabel")}</FormLabel>
            <ColumnTypeSelector
              value={selectedType}
              onChange={(value) => onTypeChange(value)}
              disabled={isEditMode}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Placeholder */}
      <FormField
        control={control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("placeholderLabel")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholderExample")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Köməkçi mətn */}
      <FormField
        control={control}
        name="help_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("helpTextLabel")}</FormLabel>
            <FormControl>
              <Input placeholder={t("helpTextExample")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Default dəyər */}
      <FormField
        control={control}
        name="default_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("defaultValueLabel")}</FormLabel>
            <FormControl>
              <Input placeholder={t("defaultValueExample")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Məcburilik */}
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>{t("requiredFieldLabel")}</FormLabel>
              <p className="text-sm text-muted-foreground">
                {t("requiredFieldDescription")}
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Sıra (indeks) */}
      <FormField
        control={control}
        name="order_index"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("orderIndexLabel")}</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder={t("orderIndexPlaceholder")} 
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
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
