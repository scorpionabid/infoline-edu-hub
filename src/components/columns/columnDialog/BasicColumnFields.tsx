
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { BasicColumnFieldsProps } from '@/types/column';
import ColumnTypeSelector from './ColumnTypeSelector';

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  control,
  errors,
  categories = [],
  form,
  columns = [],
  editColumn,
  selectedType = 'text',
  onTypeChange,
  isEditMode = false
}) => {
  const { t } = useLanguage();
  
  const handleTypeChange = (value: string) => {
    if (onTypeChange) {
      onTypeChange(value);
    }
  };

  return (
    <>
      {/* Name Field */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnName")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterColumnName")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Field */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={t("enterDescription")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Type Field */}
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnType")}</FormLabel>
            <FormControl>
              <ColumnTypeSelector 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTypeChange(value);
                }}
                disabled={isEditMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Section Field */}
      <FormField
        control={control}
        name="section"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("section")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterSectionName")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category Field */}
      {!editColumn && (
        <FormField
          control={control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("category")}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Placeholder Field */}
      <FormField
        control={control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("placeholder")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterPlaceholder")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Help Text Field */}
      <FormField
        control={control}
        name="help_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("helpText")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterHelpText")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Default Value Field */}
      <FormField
        control={control}
        name="default_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("defaultValue")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterDefaultValue")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Required Field */}
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                {t("required")}
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                {t("requiredFieldDescription")}
              </p>
            </div>
          </FormItem>
        )}
      />

      {/* Order Index Field */}
      <FormField
        control={control}
        name="order_index"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("orderIndex")}</FormLabel>
            <FormControl>
              <Input 
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                value={field.value || 0}
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
