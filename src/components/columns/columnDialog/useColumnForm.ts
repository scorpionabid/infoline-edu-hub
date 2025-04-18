
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, ColumnOption, ColumnType, ColumnValidation, COLUMN_TYPE_DEFINITIONS } from "@/types/column";
import { useLanguage } from "@/context/LanguageContext";

// Form validasiya sxemi
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
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      disabled: z.boolean().optional()
    })
  ).optional(),
  default_value: z.any().optional(),
  dependencies: z.array(z.string()).optional(),
  visibility_conditions: z.array(
    z.object({
      column_id: z.string(),
      operator: z.string(),
      value: z.any()
    })
  ).optional()
});

export type ColumnFormValues = z.infer<typeof columnFormSchema>;

export const useColumnForm = (categories: any[], editColumn?: Column | null, onSubmitCallback?: (columnData: any) => Promise<boolean>) => {
  const [selectedType, setSelectedType] = useState<ColumnType>(editColumn?.type || "text");
  const [options, setOptions] = useState<ColumnOption[]>(
    editColumn?.options && Array.isArray(editColumn.options)
      ? (editColumn.options as ColumnOption[])
      : []
  );
  const [newOption, setNewOption] = useState("");
  const isEditMode = !!editColumn;
  const { t } = useLanguage();

  // Kateqoriyalardan default kateqoriya ID-si əldə et
  const defaultCategoryId = categories && categories.length > 0 ? categories[0].id : "";
  
  // Seçilmiş tip üçün default validasiya
  const defaultValidation = COLUMN_TYPE_DEFINITIONS[selectedType]?.defaultValidation || {};

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: editColumn?.name || "",
      category_id: editColumn?.category_id || defaultCategoryId,
      type: editColumn?.type || "text",
      is_required: editColumn?.is_required !== false, // Default olaraq true
      placeholder: editColumn?.placeholder || "",
      help_text: editColumn?.help_text || "",
      order_index: editColumn?.order_index || 0,
      status: editColumn?.status || "active",
      parent_column_id: editColumn?.parent_column_id || undefined,
      validation: { ...defaultValidation, ...(editColumn?.validation as Record<string, any> || {}) },
      options: editColumn?.options as ColumnOption[] || [],
      default_value: editColumn?.default_value || "",
      dependencies: editColumn?.dependencies || [],
      visibility_conditions: editColumn?.visibility_conditions || []
    }
  });

  // Column və ya tip dəyişdikdə form sahələrini yenilə
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
      
      if (editColumn.validation) {
        form.setValue("validation", editColumn.validation as Record<string, any> || {});
      }
      
      if (editColumn.options && Array.isArray(editColumn.options)) {
        const typedOptions = editColumn.options as ColumnOption[];
        setOptions(typedOptions);
        form.setValue("options", typedOptions);
      }
      
      if (editColumn.default_value !== undefined) {
        form.setValue("default_value", editColumn.default_value);
      }
      
      if (editColumn.dependencies) {
        form.setValue("dependencies", editColumn.dependencies);
      }
      
      if (editColumn.visibility_conditions) {
        form.setValue("visibility_conditions", editColumn.visibility_conditions);
      }
    }
  }, [editColumn, form]);

  // Tip dəyişdikdə tip-spesifik sahələri yenilə
  useEffect(() => {
    form.setValue("type", selectedType);
    
    // Tip əsasında validasiyaları yenilə
    const defaultTypValidation = COLUMN_TYPE_DEFINITIONS[selectedType]?.defaultValidation || {};
    const currentValidation = form.getValues("validation") as ColumnValidation || {};
    
    if (selectedType === "number") {
      form.setValue("validation", { 
        ...defaultTypValidation,
        ...currentValidation,
        minValue: currentValidation.minValue || undefined,
        maxValue: currentValidation.maxValue || undefined
      });
    } else if (selectedType === "text" || selectedType === "textarea") {
      form.setValue("validation", { 
        ...defaultTypValidation,
        ...currentValidation,
        minLength: currentValidation.minLength || undefined,
        maxLength: currentValidation.maxLength || undefined
      });
    } else if (selectedType === "email") {
      form.setValue("validation", { 
        ...defaultTypValidation,
        ...currentValidation,
        email: true,
        pattern: currentValidation.pattern || '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      });
    } else if (selectedType === "url") {
      form.setValue("validation", { 
        ...defaultTypValidation,
        ...currentValidation,
        url: true,
        pattern: currentValidation.pattern || '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$'
      });
    }
  }, [selectedType, form]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type as ColumnType);
    form.setValue("type", type);
    
    // Əgər options tipli fielddirsə və options yoxdursa, error göstərmə
    if (["select", "radio", "checkbox"].includes(type) && (!options || options.length === 0)) {
      form.clearErrors("options");
    }
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
      
      // Form options-larını yenilə
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
    
    // Select/radio/checkbox üçün options-ları düzgün formatla
    if (["select", "radio", "checkbox"].includes(data.type)) {
      console.log("Setting options for select/radio/checkbox. Current options:", options);
      data.options = JSON.parse(JSON.stringify(options)); // Deep copy ilə referans istifadəsinin qarşısını al
      console.log("Options after assignment:", data.options);
    } else {
      // Digər field tipləri üçün options null və ya boş array olmalıdır
      data.options = [];
    }
    
    // Validasiya undefined olduqda boş obyekt təyin et
    if (!data.validation) {
      data.validation = {};
    }
    
    // Callback funksiyası təmin edildikdə, datanı göndər
    if (onSubmitCallback) {
      try {
        console.log("Calling onSubmitCallback with data:", JSON.stringify(data, null, 2));
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
