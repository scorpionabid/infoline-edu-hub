
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
  validation: z.record(z.any()).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional()
});

export type ColumnFormValues = z.infer<typeof columnFormSchema>;

export const useColumnForm = (categories: any[], editColumn?: Column | null, onSubmitCallback?: (columnData: any) => Promise<boolean>) => {
  const [selectedType, setSelectedType] = useState<ColumnType>(editColumn?.type || "text");
  const [options, setOptions] = useState<ColumnOption[]>(
    editColumn?.options && Array.isArray(editColumn.options)
      ? editColumn.options
      : []
  );
  const [newOption, setNewOption] = useState("");
  const isEditMode = !!editColumn;
  const { t } = useLanguage();

  // Extract default category_id from categories if available
  const defaultCategoryId = categories && categories.length > 0 ? categories[0].id : "";

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: editColumn?.name || "",
      category_id: editColumn?.category_id || defaultCategoryId,
      type: editColumn?.type || "text",
      is_required: editColumn?.is_required !== false, // Default to true if not explicitly false
      placeholder: editColumn?.placeholder || "",
      help_text: editColumn?.help_text || "",
      order_index: editColumn?.order_index || 0,
      status: editColumn?.status || "active",
      parent_column_id: editColumn?.parent_column_id || undefined,
      validation: editColumn?.validation || {},
      options: editColumn?.options || []
    }
  });

  // Update form fields when column or type changes
  useEffect(() => {
    if (editColumn) {
      form.setValue("name", editColumn.name);
      form.setValue("category_id", editColumn.category_id);
      form.setValue("type", editColumn.type);
      form.setValue("is_required", editColumn.is_required !== false);
      form.setValue("placeholder", editColumn.placeholder || "");
      form.setValue("help_text", editColumn.help_text || "");
      form.setValue("order_index", editColumn.order_index || 0);
      form.setValue("status", editColumn.status || "active");
      form.setValue("parent_column_id", editColumn.parent_column_id);
      form.setValue("validation", editColumn.validation || {});
      
      if (editColumn.options && Array.isArray(editColumn.options)) {
        setOptions(editColumn.options);
        form.setValue("options", editColumn.options);
      }
    }
  }, [editColumn, form]);

  // Update type-specific fields when type changes
  useEffect(() => {
    form.setValue("type", selectedType);
    
    // Reset validation based on type
    if (selectedType === "number") {
      form.setValue("validation", { 
        ...form.getValues("validation"),
        minValue: form.getValues("validation")?.minValue || undefined,
        maxValue: form.getValues("validation")?.maxValue || undefined
      });
    } else if (selectedType === "text" || selectedType === "textarea") {
      form.setValue("validation", { 
        ...form.getValues("validation"),
        minLength: form.getValues("validation")?.minLength || undefined,
        maxLength: form.getValues("validation")?.maxLength || undefined
      });
    }
  }, [selectedType, form]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type as ColumnType);
    form.setValue("type", type);
  };

  const addOption = () => {
    if (newOption.trim() !== "") {
      const newOptionObj: ColumnOption = { 
        label: newOption, 
        value: newOption.toLowerCase().replace(/\s+/g, '_') 
      };
      const updatedOptions = [...options, newOptionObj];
      setOptions(updatedOptions);
      setNewOption("");
      
      // Update form options
      form.setValue("options", updatedOptions);
    }
  };

  const removeOption = (optionToRemove: ColumnOption) => {
    const updatedOptions = options.filter(
      (option) => option.value !== optionToRemove.value
    );
    setOptions(updatedOptions);
    form.setValue("options", updatedOptions);
  };

  const onSubmit = async (data: ColumnFormValues) => {
    console.log("onSubmit called with data:", data);
    
    // Ensure options are correctly formatted for select/radio/checkbox
    if (["select", "radio", "checkbox"].includes(data.type)) {
      data.options = options;
    }
    
    // Ensure validation is an object if undefined
    if (!data.validation) {
      data.validation = {};
    }
    
    // If callback is provided, pass the data to it
    if (onSubmitCallback) {
      try {
        console.log("Calling onSubmitCallback with data:", data);
        const result = await onSubmitCallback(data);
        console.log("onSubmitCallback result:", result);
        return result;
      } catch (error) {
        console.error("Error in onSubmitCallback:", error);
        return false;
      }
    }
    
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
