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

/**
 * Options-ları düzgün formatda əldə etmək üçün funksiya
 * @param options - Sütunun options məlumatları (string, array və ya obyekt ola bilər)
 * @returns Düzgün formatda olan options array-i
 */
const parseColumnOptions = (options: any): ColumnOption[] => {
  if (!options) return [];
  
  console.log("Parsing column options:", options);
  
  // Əgər artıq array formatındadırsa
  if (Array.isArray(options)) {
    // Hər bir elementin label və value xüsusiyyətləri olduğunu yoxlayırıq
    return options.map(option => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      }
      
      // Əgər obyektdirsə, label və value-nu təmin edirik
      return {
        label: option.label || option.name || String(option.value || option),
        value: String(option.value !== undefined ? option.value : (option.id || option.label || option)),
        description: option.description,
        icon: option.icon,
        disabled: option.disabled
      };
    });
  }
  
  // Əgər string formatındadırsa, JSON kimi parse etməyə çalışırıq
  if (typeof options === 'string') {
    try {
      // Əvvəlcə düz JSON kimi parse etməyə çalışırıq
      const parsedOptions = JSON.parse(options);
      return parseColumnOptions(parsedOptions); // Rekursiv olaraq parse edirik
    } catch (e) {
      console.warn("Failed to parse options as JSON:", e);
      
      // Əgər JSON parse etmək alınmırsa, vergüllə ayrılmış siyahı kimi qəbul edirik
      return options.split(',')
        .map(opt => opt.trim())
        .filter(opt => opt)
        .map(opt => ({ label: opt, value: opt }));
    }
  }
  
  // Əgər obyekt formatındadırsa (key-value pairs)
  if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
    return Object.entries(options).map(([key, value]) => ({
      label: String(value),
      value: key
    }));
  }
  
  return [];
};

export const useColumnForm = (categories: any[], editColumn?: Column | null, onSubmitCallback?: (columnData: any) => Promise<boolean>) => {
  const [selectedType, setSelectedType] = useState<ColumnType>(editColumn?.type || "text");
  const [options, setOptions] = useState<ColumnOption[]>([]);
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
      options: [],
      default_value: editColumn?.default_value || "",
      dependencies: editColumn?.dependencies || [],
      visibility_conditions: editColumn?.visibility_conditions || []
    }
  });

  // Column və ya tip dəyişdikdə form sahələrini yenilə
  useEffect(() => {
    if (editColumn) {
      console.log("Initializing form with edit column:", editColumn);
      
      form.setValue("name", editColumn.name);
      form.setValue("category_id", editColumn.category_id);
      form.setValue("type", editColumn.type);
      form.setValue("is_required", editColumn.is_required !== false);
      form.setValue("placeholder", editColumn.placeholder || "");
      form.setValue("help_text", editColumn.help_text || "");
      form.setValue("order_index", editColumn.order_index || 0);
      form.setValue("status", editColumn.status || "active");
      
      if (editColumn.parent_column_id) {
        form.setValue("parent_column_id", editColumn.parent_column_id);
      }
      
      if (editColumn.validation) {
        form.setValue("validation", editColumn.validation as Record<string, any> || {});
      }
      
      // Options-ları parse et və təyin et
      const parsedOptions = parseColumnOptions(editColumn.options);
      console.log("Parsed options:", parsedOptions);
      setOptions(parsedOptions);
      form.setValue("options", parsedOptions);
      
      if (editColumn.default_value !== undefined) {
        form.setValue("default_value", editColumn.default_value);
      }
      
      if (editColumn.dependencies) {
        form.setValue("dependencies", editColumn.dependencies);
      }
      
      if (editColumn.visibility_conditions) {
        form.setValue("visibility_conditions", editColumn.visibility_conditions);
      }
      
      // Tip-i təyin et
      setSelectedType(editColumn.type as ColumnType);
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
    } else if (selectedType === "date") {
      form.setValue("validation", { 
        ...defaultTypValidation,
        ...currentValidation,
        minDate: currentValidation.minDate || undefined,
        maxDate: currentValidation.maxDate || undefined
      });
    } else if (selectedType === "select" || selectedType === "radio" || selectedType === "checkbox") {
      // Options sahəsinin dəyərini yenilə
      form.setValue("options", options);
    }
  }, [selectedType, form, options]);

  // Yeni option əlavə etmə funksiyası
  const addOption = (option: string) => {
    if (!option.trim()) return;
    
    const newOptionObj: ColumnOption = { label: option, value: option };
    const updatedOptions = [...options, newOptionObj];
    setOptions(updatedOptions);
    form.setValue("options", updatedOptions);
    setNewOption("");
  };

  // Option silmə funksiyası
  const removeOption = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
    form.setValue("options", updatedOptions);
  };

  // Form təqdim etmə funksiyası
  const onSubmit = async (values: ColumnFormValues) => {
    console.log("Form submitted with values:", values);
    
    // Tip əsasında options-ları yoxla
    if (["select", "radio", "checkbox"].includes(selectedType) && (!values.options || values.options.length === 0)) {
      console.error("Options are required for this column type");
      return false;
    }
    
    try {
      // Callback funksiyasını çağır
      if (onSubmitCallback) {
        const result = await onSubmitCallback({
          ...values,
          type: selectedType,
          options: values.options || options
        });
        
        return result;
      }
      
      return true;
    } catch (error) {
      console.error("Error submitting form:", error);
      return false;
    }
  };

  // Tip dəyişmə funksiyası
  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
  };

  return {
    form,
    selectedType,
    handleTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode
  };
};
