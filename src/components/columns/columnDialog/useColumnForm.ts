
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
  validation: z.object({}).optional()
});

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

  const form = useForm<z.infer<typeof columnFormSchema>>({
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
      validation: column?.validation || {}
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
    }
  };

  const removeOption = (optionToRemove: ColumnOption) => {
    setOptions(options.filter((option) => option.value !== optionToRemove.value));
  };

  const onSubmit = async (data: z.infer<typeof columnFormSchema>) => {
    // Əgər istifadəçi tərəfindən təqdim edilmiş əlavə funksiya varsa
    if (onAddColumn) {
      // Əlavə options əlavə edirik (select, radio, checkbox üçün)
      if (["select", "radio", "checkbox"].includes(data.type)) {
        data.options = options;
      }
      
      // Əgər istifadəçi tərəfindən təqdim edilmiş onAddColumn funksiyasını çağırırıq
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
