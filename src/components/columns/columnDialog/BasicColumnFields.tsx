import React from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { Column } from "@/types/column";
import { UseFormReturn } from "react-hook-form";
import { ColumnFormValues } from './useColumnForm';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicColumnFieldsProps {
  form: UseFormReturn<ColumnFormValues>;
  categories: { id: string; name: string }[];
  columns?: Column[];
  editColumn?: Column;
  selectedType: string;
  handleTypeChange: (value: string) => void;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  categories,
  columns = [],
  editColumn,
  selectedType,
  handleTypeChange
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Column Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnName")}</FormLabel>
            <FormControl>
              <Input placeholder={t("enterColumnName")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
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
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    {t("noCategories")}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              {categories && categories.length === 0 && t("pleaseAddCategoriesFirst")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Column Type */}
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnType")}</FormLabel>
            <Select
              onValueChange={(value) => handleTypeChange(value)}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="text">{t("text")}</SelectItem>
                <SelectItem value="number">{t("number")}</SelectItem>
                <SelectItem value="date">{t("date")}</SelectItem>
                <SelectItem value="select">{t("select")}</SelectItem>
                <SelectItem value="checkbox">{t("checkbox")}</SelectItem>
                <SelectItem value="radio">{t("radio")}</SelectItem>
                <SelectItem value="file">{t("file")}</SelectItem>
                <SelectItem value="image">{t("image")}</SelectItem>
                <SelectItem value="email">{t("email")}</SelectItem>
                <SelectItem value="phone">{t("phone")}</SelectItem>
                <SelectItem value="boolean">{t("boolean")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Required Field */}
      <FormField
        control={form.control}
        name="isRequired"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>{t("required")}</FormLabel>
              <FormDescription>
                {t("requiredFieldDescription")}
              </FormDescription>
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

      {/* Order */}
      <FormField
        control={form.control}
        name="order"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("order")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={t("enterOrder")}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Parent Column (if any) */}
      <FormField
        control={form.control}
        name="parentColumnId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("parentColumn")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectParentColumn")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">{t("noParent")}</SelectItem>
                {columns
                  .filter(col => col.id !== editColumn?.id) // Filter out the current column in edit mode
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

      {/* Placeholder */}
      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("placeholder")}</FormLabel>
            <FormControl>
              <Input placeholder={t("enterPlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Help Text */}
      <FormField
        control={form.control}
        name="helpText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("helpText")}</FormLabel>
            <FormControl>
              <Textarea placeholder={t("enterHelpText")} {...field} />
            </FormControl>
            <FormDescription>
              {t("helpTextDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Deadline */}
      <FormField
        control={form.control}
        name="deadline"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("deadline")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{t("selectDeadline")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              {t("deadlineDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Default Value */}
      {(selectedType === "text" || selectedType === "number") && (
        <FormField
          control={form.control}
          name="defaultValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("defaultValue")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("enterDefaultValue")}
                  type={selectedType === "number" ? "number" : "text"}
                  {...field}
                  onChange={(e) => 
                    field.onChange(selectedType === "number" ? 
                      (e.target.value === "" ? "" : String(parseFloat(e.target.value) || 0)) : 
                      e.target.value
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Status */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("status")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("inactive")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicColumnFields;
