
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
import { Column, ColumnType } from "@/types/column";

interface BasicColumnFieldsProps {
  form: UseFormReturn<any>;
  categories: { id: string; name: string }[];
  columns: Column[];
  editColumn?: Column;
  selectedType: ColumnType;
  handleTypeChange: (value: string) => void;
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

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnName")}</FormLabel>
            <FormControl>
              <Input placeholder={t("columnNamePlaceholder")} {...field} />
            </FormControl>
            <FormDescription>{t("columnNameDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("category")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
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
            <FormDescription>{t("categoryDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnType")}</FormLabel>
            <Select
              onValueChange={(value) => {
                handleTypeChange(value);
                field.onChange(value);
              }}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectColumnType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="text">{t("text")}</SelectItem>
                <SelectItem value="textarea">{t("textarea")}</SelectItem>
                <SelectItem value="number">{t("number")}</SelectItem>
                <SelectItem value="date">{t("date")}</SelectItem>
                <SelectItem value="select">{t("select")}</SelectItem>
                <SelectItem value="checkbox">{t("checkbox")}</SelectItem>
                <SelectItem value="radio">{t("radio")}</SelectItem>
                <SelectItem value="email">{t("email")}</SelectItem>
                <SelectItem value="phone">{t("phone")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>{t("columnTypeDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isRequired"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t("isRequired")}</FormLabel>
              <FormDescription>{t("isRequiredDescription")}</FormDescription>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="order"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("order")}</FormLabel>
            <FormControl>
              <Input type="number" min="1" {...field} />
            </FormControl>
            <FormDescription>{t("orderDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
