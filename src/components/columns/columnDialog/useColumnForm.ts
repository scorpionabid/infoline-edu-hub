
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, ColumnType, ColumnOption, adaptColumnToSupabase } from "@/types/column";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, { message: t("columnNameRequired") }),
    categoryId: z.string().min(1, { message: t("categoryRequired") }),
    type: z.enum(["text", "number", "date", "select", "multiselect", "checkbox", "radio", "file", "image", "email", "phone", "textarea"]) as z.ZodType<ColumnType>,
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

  const formSchema = createFormSchema(t);

  const form = useForm<ColumnFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      type: "text" as ColumnType,
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
        validationRules: editColumn.validation as any,
        defaultValue: editColumn.defaultValue || "",
        placeholder: editColumn.placeholder || "",
        helpText: editColumn.helpText || "",
        order: editColumn.order || 1,
        parentColumnId: editColumn.parentColumnId,
        status: editColumn.status as "active" | "inactive" || "active",
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
        type: "text" as ColumnType,
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

  const onSubmit = async (values: ColumnFormData) => {
    try {
      if (!onAddColumn) return false;
      
      // validationRules -> validation olaraq çeviririk
      const supabaseColumnData = {
        name: values.name,
        category_id: values.categoryId,
        type: values.type as string,
        is_required: values.isRequired,
        validation: JSON.stringify(values.validationRules || null),
        default_value: values.defaultValue || null,
        placeholder: values.placeholder || null,
        help_text: values.helpText || null,
        order_index: values.order,
        status: values.status,
        options: ["select", "multiselect", "checkbox", "radio"].includes(values.type) ? JSON.stringify(options) : null
      };
      
      if (isEditMode && editColumn?.id) {
        const { error } = await supabase
          .from('columns')
          .update(supabaseColumnData)
          .eq('id', editColumn.id);
          
        if (error) throw error;
        
        return true;
      } else {
        const { error } = await supabase
          .from('columns')
          .insert([supabaseColumnData]);
          
        if (error) throw error;
        
        const { error: updateError } = await supabase
          .from('categories')
          .select('column_count')
          .eq('id', values.categoryId)
          .single();
        
        if (!updateError) {
          const { count, error: countError } = await supabase
            .from('columns')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', values.categoryId);
          
          if (!countError) {
            await supabase
              .from('categories')
              .update({ column_count: count || 0 })
              .eq('id', values.categoryId);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error("Form təqdim edilərkən xəta:", error);
      return false;
    }
  };

  const handleTypeChange = (value: string) => {
    const typeValue = value as ColumnType;
    setSelectedType(typeValue);
    form.setValue("type", typeValue);
  };

  const addOption = () => {
    if (newOption.trim() !== "" && !options.some(opt => opt.value === newOption.trim())) {
      setOptions([...options, { label: newOption.trim(), value: newOption.trim() }]);
      setNewOption("");
    }
  };

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
