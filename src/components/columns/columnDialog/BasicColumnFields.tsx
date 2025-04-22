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
  form?: any;
  control?: any;
  categories: any[];
  columns?: Column[];
  editColumn?: Column | null;
  selectedType: ColumnType;
  handleTypeChange?: (type: string) => void;
  onTypeChange?: (type: string) => void;
  isEditMode?: boolean;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  form,
  control,
  categories,
  columns = [],
  editColumn,
  selectedType,
  handleTypeChange,
  onTypeChange,
  isEditMode = false
}) => {
  const { t } = useLanguage();

  // Seçilmiş sütun tipinin tərifini (icon, açıqlama və s.) alaq
  const selectedTypeDefinition = COLUMN_TYPE_DEFINITIONS[selectedType];
  
  // Control-u form-dan və ya birbaşa prop-dan əldə edirik
  const formControl = control || (form ? form.control : null);
  
  // Type dəyişmə funksiyasını müəyyən edirik
  const handleTypeChangeFunc = onTypeChange || handleTypeChange || ((type: string) => {
    console.log("Type changed to", type);
  });
  
  // Əgər formControl yoxdursa, xəta log edirik
  if (!formControl) {
    console.error("BasicColumnFields: Neither form.control nor control prop provided");
    return (
      <div className="p-4 border border-destructive rounded-md">
        <p className="text-destructive">Form control not provided to BasicColumnFields</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={formControl}
        name="category_id"
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
        control={formControl}
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

      <div className="space-y-2">
        <Label>{t("columnType")}</Label>
        <ColumnTypeSelector
          selectedType={selectedType}
          onTypeChange={handleTypeChangeFunc}
          disabled={isEditMode}
        />
        {selectedTypeDefinition && (
          <p className="text-sm text-muted-foreground">
            {selectedTypeDefinition.description}
          </p>
        )}
      </div>

      <FormField
        control={formControl}
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
          </FormItem>
        )}
      />

      <FormField
        control={formControl}
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
        control={formControl}
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

      <FormField
        control={formControl}
        name="order_index"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("orderIndex")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={t("enterOrderIndex")}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>{t("orderIndexDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
