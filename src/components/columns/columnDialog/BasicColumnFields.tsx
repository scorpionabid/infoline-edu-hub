
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import { ColumnType } from "@/types/column";

interface BasicColumnFieldsProps {
  form: UseFormReturn<any>;
  categories: any[];
  selectedType: ColumnType;
  onTypeChange: (type: string) => void;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  categories,
  selectedType,
  onTypeChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnName")}</FormLabel>
            <FormControl>
              <Input placeholder={t("enterColumnName")} {...field} />
            </FormControl>
            <FormDescription>
              {t("columnNameDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("category")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
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
            <FormDescription>
              {t("categoryDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fieldType")}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange(value);
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectFieldType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="text">{t("text")}</SelectItem>
                <SelectItem value="number">{t("number")}</SelectItem>
                <SelectItem value="textarea">{t("textarea")}</SelectItem>
                <SelectItem value="select">{t("select")}</SelectItem>
                <SelectItem value="checkbox">{t("checkbox")}</SelectItem>
                <SelectItem value="radio">{t("radio")}</SelectItem>
                <SelectItem value="date">{t("date")}</SelectItem>
                <SelectItem value="file">{t("file")}</SelectItem>
                <SelectItem value="image">{t("image")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {t("fieldTypeDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
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
              <FormDescription>
                {t("requiredDescription")}
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
