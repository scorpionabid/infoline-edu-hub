
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, ColumnOption, ColumnType } from "@/types/column";
import { useLanguage } from "@/context/LanguageContext";

// Form validation schema
const columnFormSchema = z.object({
  name: z.string().min(2, { message: "Column name must be at least 2 characters." }),
  category_id: z.string().uuid({ message: "Please select a valid category." }),
  type: z.string(),
  is_required: z.boolean().default(false),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  order_index: z.number().optional().default(0),
  status: z.string().optional().default("active"),
  parent_column_id: z.string().uuid({ message: "Please select a valid parent column." }).nullable().optional(),
  validation: z.object({}).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional()
});

export type ColumnFormValues = z.infer<typeof columnFormSchema>;

interface UseColumnFormProps {
  categories: any[];
  column: Column | null;
  onAddColumn?: (columnData: Omit<Column, "id"> & { id?: string }) => Promise<boolean>;
}

export const useColumnForm = (categories: any[], column: Column | null, onAddColumn?: (columnData: any) => Promise<boolean>) => {
  const [selectedType, setSelectedType] = useState<ColumnType>(column?.type || "text");
  const [options, setOptions] = useState<ColumnOption[]>(
    column?.options && Array.isArray(column.options)
      ? column.options.map((option: any) => ({
          label: option.label || option,
          value: option.value || option,
        }))
      : []
  );
  const [newOption, setNewOption] = useState("");
  const isEditMode = !!column;
  const { t } = useLanguage();

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: column?.name || "",
      category_id: column?.category_id || (categories[0]?.id || ""),
      type: column?.type || "text",
      is_required: column?.is_required !== false,
      placeholder: column?.placeholder || "",
      help_text: column?.help_text || "",
      order_index: column?.order_index || 0,
      status: column?.status || "active",
      parent_column_id: column?.parent_column_id || undefined,
      validation: column?.validation || {},
      options: column?.options && Array.isArray(column.options) 
        ? column.options.map((option: any) => ({
            label: option.label || option,
            value: option.value || option,
          }))
        : []
    }
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type as ColumnType);
    form.setValue("type", type);
  };

  const addOption = () => {
    if (newOption.trim() !== "") {
      const newOptionObj: ColumnOption = { label: newOption, value: newOption };
      setOptions([...options, newOptionObj]);
      setNewOption("");
      
      // Form's options field değerini güncelleme
      const formOptions = form.getValues("options") || [];
      form.setValue("options", [...formOptions, newOptionObj]);
    }
  };

  const removeOption = (optionToRemove: ColumnOption) => {
    const updatedOptions = options.filter((option) => option.value !== optionToRemove.value);
    setOptions(updatedOptions);
    
    // Form's options field değerini güncelleme
    form.setValue("options", updatedOptions);
  };

  const onSubmit = async (data: ColumnFormValues) => {
    // Hazırda seçilmiş optionları data-ya əlavə et
    if (["select", "radio", "checkbox"].includes(data.type)) {
      data.options = options;
    }
    
    // Əgər xarici onAddColumn funksiyası varsa onu çağır
    if (onAddColumn) {
      const result = await onAddColumn(data);
      return result;
    }
    
    console.log("Form submitted with data:", data);
    return true;
  };

  return {
    form,
    selectedType,
    handleTypeChange,
    options,
    setOptions,
    newOption,
    setNewOption,
    addOption,
    removeOption,
    onSubmit,
    isEditMode,
    t
  };
};
