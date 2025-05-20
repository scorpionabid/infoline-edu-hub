
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ColumnFormValues, ColumnOption, Column } from '@/types/column';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseColumnFormProps {
  column?: Column | null;
  categoryId?: string;
  onSave?: (data: any) => Promise<boolean>;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  category_id: z.string().min(1, 'Category is required'),
  is_required: z.boolean().default(true),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  default_value: z.string().optional(),
  description: z.string().optional(),
  section: z.string().optional(),
  validation: z.any().optional(),
  options: z.array(
    z.object({
      id: z.string().optional(),
      label: z.string().min(1, 'Label is required'),
      value: z.string().min(1, 'Value is required'),
    })
  ).optional(),
  order_index: z.number().optional(),
});

export const useColumnForm = ({ column, categoryId, onSave }: UseColumnFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(column?.type || 'text');
  const [isEditMode, setIsEditMode] = useState<boolean>(!!column);
  const [options, setOptions] = useState<ColumnOption[]>(column?.options || []);
  const [newOption, setNewOption] = useState<Partial<ColumnOption>>({ label: '', value: '' });
  
  // Form setup
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: column?.name || '',
      type: column?.type || 'text',
      category_id: column?.category_id || categoryId || '',
      is_required: column?.is_required !== undefined ? column.is_required : true,
      placeholder: column?.placeholder || '',
      help_text: column?.help_text || '',
      default_value: column?.default_value || '',
      description: column?.description || '',
      section: column?.section || '',
      validation: column?.validation || {},
      options: column?.options || [],
      order_index: column?.order_index || 0,
    },
  });

  // Update form when column type changes
  useEffect(() => {
    form.setValue('type', selectedType);
    
    // Clear options when switching to a non-option type
    if (!['select', 'radio', 'checkbox', 'multiselect'].includes(selectedType)) {
      setOptions([]);
      form.setValue('options', []);
    }
  }, [selectedType, form]);

  // Handle type change
  const onTypeChange = (type: string) => {
    setSelectedType(type);
  };

  // Add a new option
  const addOption = () => {
    if (!newOption.label || !newOption.value) return;
    
    const newOptionWithId: ColumnOption = {
      id: crypto.randomUUID(),
      label: newOption.label,
      value: newOption.value,
    };
    
    const updatedOptions = [...options, newOptionWithId];
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
    setNewOption({ label: '', value: '' });
  };

  // Remove an option
  const removeOption = (optionId: string) => {
    const updatedOptions = options.filter(opt => opt.id !== optionId);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  };

  // Form submission handler
  const onSubmit = async (data: ColumnFormValues): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Ensure options are set for types that need them
      if (['select', 'radio', 'checkbox', 'multiselect'].includes(data.type) && (!data.options || data.options.length === 0)) {
        toast.error('This field type requires at least one option');
        setIsLoading(false);
        return false;
      }

      if (onSave) {
        // Use the provided save function
        const result = await onSave(data);
        setIsLoading(false);
        return result;
      }
      
      // Default database logic
      if (column?.id) {
        // Update existing column
        const { error } = await supabase
          .from('columns')
          .update({
            name: data.name,
            type: data.type,
            is_required: data.is_required,
            placeholder: data.placeholder,
            help_text: data.help_text,
            default_value: data.default_value,
            description: data.description,
            section: data.section,
            validation: data.validation || {},
            options: data.options || [],
            order_index: data.order_index || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', column.id);

        if (error) throw error;
        toast.success('Column updated successfully');
        return true;
      } else {
        // Create new column
        const { error } = await supabase
          .from('columns')
          .insert({
            name: data.name,
            type: data.type,
            category_id: data.category_id,
            is_required: data.is_required,
            placeholder: data.placeholder,
            help_text: data.help_text,
            default_value: data.default_value,
            description: data.description,
            section: data.section,
            validation: data.validation || {},
            options: data.options || [],
            order_index: data.order_index || 0,
          });

        if (error) throw error;
        toast.success('Column created successfully');
        return true;
      }
    } catch (error: any) {
      console.error('Error saving column:', error);
      toast.error(error.message || 'Error saving column');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleSubmit: form.handleSubmit(onSubmit),
    selectedType,
    onTypeChange,
    options,
    addOption,
    removeOption,
    newOption, 
    setNewOption,
    onSubmit,
    isEditMode,
    setOptions
  };
};
