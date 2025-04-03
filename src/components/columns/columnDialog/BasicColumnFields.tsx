
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Column } from "@/types/column";
import { ColumnFormValues } from './useColumnForm';

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
  const columnTypes = [
    { value: "text", label: "Mətn" },
    { value: "number", label: "Rəqəm" },
    { value: "date", label: "Tarix" },
    { value: "select", label: "Seçim" },
    { value: "checkbox", label: "İşarələmə" },
    { value: "radio", label: "Radio" },
    { value: "textarea", label: "Mətn sahəsi" },
    { value: "email", label: "E-mail" },
    { value: "phone", label: "Telefon" }
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sütun adı</FormLabel>
            <FormControl>
              <Input placeholder="Sütunun adını daxil edin" {...field} />
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
            <FormLabel>Kateqoriya</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || categoryId}
              disabled={!!categoryId}
            >
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
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sütun tipi</FormLabel>
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
                  <SelectValue placeholder="Tip seçin" />
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
            <FormLabel>Məcburidir</FormLabel>
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
            <FormLabel>Placeholder</FormLabel>
            <FormControl>
              <Input placeholder="Placeholder mətnini daxil edin" {...field} />
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
            <FormLabel>Köməkçi mətn</FormLabel>
            <FormControl>
              <Input placeholder="Köməkçi mətn daxil edin" {...field} />
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
            <FormLabel>Sıra nömrəsi</FormLabel>
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
