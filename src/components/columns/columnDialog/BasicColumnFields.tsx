
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Column, ColumnType, COLUMN_TYPE_DEFINITIONS } from "@/types/column";
import ColumnTypeSelector from "./ColumnTypeSelector";

interface BasicColumnFieldsProps {
  form: any;
  categories: any[];
  columns: Column[];
  editColumn?: Column | null;
  selectedType: ColumnType;
  handleTypeChange: (type: string) => void;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  categories,
  columns,
  editColumn,
  selectedType,
  handleTypeChange,
}) => {
  const { t } = useLanguage();

  // Seçilmiş sütun tipinin tərifini (icon, açıqlama və s.) alaq
  const selectedTypeDefinition = COLUMN_TYPE_DEFINITIONS[selectedType];

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("category")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              disabled={!!editColumn} // Düzənləmə zamanı kateqoriya dəyişdirilə bilməz
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
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
            <FormDescription>{t("selectCategoryDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnName")}</FormLabel>
            <FormControl>
              <Input placeholder={t("enterColumnName")} {...field} />
            </FormControl>
            <FormDescription>{t("columnNameDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sütun tipi seçimini əvəz edirik */}
      <ColumnTypeSelector 
        control={form.control} 
        onChange={(type) => handleTypeChange(type)}
        value={selectedType}
      />

      <FormField
        control={form.control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>{t("required")}</FormLabel>
              <FormDescription>{t("requiredDescription")}</FormDescription>
            </div>
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
        name="order_index"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("orderIndex")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={t("enterOrderIndex")}
                {...field}
                onChange={(e) => {
                  field.onChange(parseInt(e.target.value) || 0);
                }}
              />
            </FormControl>
            <FormDescription>{t("orderIndexDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("placeholder")}</FormLabel>
            <FormControl>
              <Input placeholder={t("enterPlaceholder")} {...field} />
            </FormControl>
            <FormDescription>{t("placeholderDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="help_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("helpText")}</FormLabel>
            <FormControl>
              <Input placeholder={t("enterHelpText")} {...field} />
            </FormControl>
            <FormDescription>{t("helpTextDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {columns.length > 0 && (
        <FormField
          control={form.control}
          name="parent_column_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("parentColumn")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectParentColumn")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">{t("noParentColumn")}</SelectItem>
                  {columns
                    .filter(
                      (col) => !editColumn || col.id !== editColumn.id
                    )
                    .map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("parentColumnDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default BasicColumnFields;
