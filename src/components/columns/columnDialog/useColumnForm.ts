
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, ColumnType, ColumnOption } from "@/types/column";
import { useLanguage } from "@/context/LanguageContext";

// Form sxemasını yaratmaq üçün funksiya
export const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, { message: t("columnNameRequired") }),
    categoryId: z.string().min(1, { message: t("categoryRequired") }),
    type: z.enum(["text", "number", "date", "select", "checkbox", "radio", "file", "image", "email", "phone", "boolean", "textarea"]),
    isRequired: z.boolean().default(false),
    validationRules: z.object({
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      format: z.string().optional(),
      regex: z.string().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      patternError: z.string().optional(),
      minDate: z.string().optional(),
      maxDate: z.string().optional(),
    }).optional(),
    defaultValue: z.string().optional(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    deadline: z.date().optional(),
    order: z.number().positive().int(),
    parentColumnId: z.string().optional(),
    status: z.enum(["active", "inactive"]).default("active"),
    options: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
  });
};

export type ColumnFormValues = z.infer<ReturnType<typeof createFormSchema>>;
export type ColumnFormData = ColumnFormValues;

export const useColumnForm = (
  categories: { id: string; name: string }[],
  editColumn?: Column,
  onAddColumn?: (newColumn: Omit<Column, "id">) => Promise<boolean>
) => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<ColumnType>(editColumn?.type || "text");
  const [options, setOptions] = useState<ColumnOption[]>(
    editColumn?.options 
      ? Array.isArray(editColumn.options) 
        ? editColumn.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt as ColumnOption)
        : []
      : []
  );
  const [newOption, setNewOption] = useState("");
  const isEditMode = !!editColumn;

  // Form sxeması yaratmaq
  const formSchema = createFormSchema(t);

  // Formu inisializasiya etmək
  const form = useForm<ColumnFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      type: "text",
      isRequired: false,
      validationRules: {
        minValue: undefined,
        maxValue: undefined,
        format: "",
        regex: "",
        minLength: undefined,
        maxLength: undefined,
        pattern: "",
        patternError: "",
        minDate: "",
        maxDate: "",
      },
      defaultValue: "",
      placeholder: "",
      helpText: "",
      deadline: undefined,
      order: 1,
      parentColumnId: undefined,
      status: "active",
      options: [],
    },
  });

  // Redaktə rejimində form dəyərlərini təyin etmək
  useEffect(() => {
    if (isEditMode && editColumn) {
      setSelectedType(editColumn.type);
      
      if (editColumn.options) {
        setOptions(
          Array.isArray(editColumn.options) 
            ? editColumn.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt as ColumnOption)
            : []
        );
      }
      
      form.reset({
        name: editColumn.name,
        categoryId: editColumn.categoryId,
        type: editColumn.type,
        isRequired: editColumn.isRequired,
        validationRules: editColumn.validationRules,
        defaultValue: editColumn.defaultValue || "",
        placeholder: editColumn.placeholder || "",
        helpText: editColumn.helpText || "",
        deadline: editColumn.deadline ? new Date(editColumn.deadline) : undefined,
        order: editColumn.order,
        parentColumnId: editColumn.parentColumnId,
        status: editColumn.status,
        options: editColumn.options 
          ? Array.isArray(editColumn.options) 
            ? editColumn.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt as ColumnOption)
            : []
          : [],
      });
    } else {
      setSelectedType("text");
      setOptions([]);
      form.reset({
        name: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        type: "text",
        isRequired: false,
        validationRules: {
          minValue: undefined,
          maxValue: undefined,
          format: "",
          regex: "",
          minLength: undefined,
          maxLength: undefined,
          pattern: "",
          patternError: "",
          minDate: "",
          maxDate: "",
        },
        defaultValue: "",
        placeholder: "",
        helpText: "",
        deadline: undefined,
        order: 1,
        parentColumnId: undefined,
        status: "active",
        options: [],
      });
    }
  }, [isEditMode, editColumn, form, categories]);

  // Form təqdimatını emal etmək
  const onSubmit = async (values: ColumnFormData) => {
    try {
      if (!onAddColumn) return false;
      
      // Column tipindən bütün tələb olunan sahələrin mövcud olmasını və düzgün tiplənməsini təmin etmək
      const columnData: Omit<Column, "id"> = {
        name: values.name, 
        categoryId: values.categoryId,
        type: values.type,
        isRequired: values.isRequired,
        validationRules: values.validationRules ? {
          ...values.validationRules,
          // Date obyektləri string-ə çevirmək
          minDate: values.validationRules.minDate,
          maxDate: values.validationRules.maxDate
        } : undefined,
        defaultValue: values.defaultValue || undefined,
        placeholder: values.placeholder || undefined,
        helpText: values.helpText || undefined,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        order: values.order,
        parentColumnId: values.parentColumnId || undefined,
        status: values.status,
        // Seçimlər yalnız seçim növü sahəsi dəstəkləyirsə əlavə edirik
        options: ["select", "checkbox", "radio"].includes(values.type) 
          ? options
          : undefined,
      };

      return await onAddColumn(columnData);
    } catch (error) {
      console.error("Form təqdim edilərkən xəta:", error);
      return false;
    }
  };

  // Tip dəyişikliyini emal etmək
  const handleTypeChange = (value: string) => {
    setSelectedType(value as ColumnType);
    form.setValue("type", value as ColumnType);
  };

  // Yeni seçim əlavə etmək
  const addOption = () => {
    if (newOption.trim() !== "" && !options.some(opt => opt.value === newOption.trim())) {
      setOptions([...options, { label: newOption.trim(), value: newOption.trim() }]);
      setNewOption("");
    }
  };

  // Seçimi silmək
  const removeOption = (optionValue: string) => {
    setOptions(options.filter((o) => o.value !== optionValue));
  };

  return {
    form,
    selectedType,
    options,
    newOption,
    setNewOption,
    handleTypeChange,
    addOption,
    removeOption,
    onSubmit,
    isEditMode,
    t,
  };
};
