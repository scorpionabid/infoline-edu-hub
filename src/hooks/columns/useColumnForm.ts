
import { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ColumnFormValues, ColumnOption, Column, ColumnType } from '@/types/column';
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
  const [selectedType, setSelectedType] = useState<ColumnType>(column?.type || 'text');
  const [isEditMode, setIsEditMode] = useState<boolean>(!!column);
  const [options, setOptions] = useState<ColumnOption[]>(column?.options || []);
  const [newOption, setNewOption] = useState<Partial<ColumnOption>>({ label: '', value: '' });
  
  console.log('useColumnForm initialized:', { column, categoryId, isEditMode });
  
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

  // Update form when column changes
  useEffect(() => {
    console.log('useColumnForm useEffect - column changed:', column);
    setIsEditMode(!!column);
    
    if (column) {
      console.log('Resetting form with column data:', column);
      form.reset({
        name: column.name,
        type: column.type,
        category_id: column.category_id,
        is_required: column.is_required !== undefined ? column.is_required : true,
        placeholder: column.placeholder || '',
        help_text: column.help_text || '',
        default_value: column.default_value || '',
        description: column.description || '',
        section: column.section || '',
        validation: column.validation || {},
        options: column.options || [],
        order_index: column.order_index || 0,
      });
      setSelectedType(column.type);
      setOptions(column.options || []);
    } else {
      console.log('Resetting form for new column with categoryId:', categoryId);
      form.reset({
        name: '',
        type: 'text',
        category_id: categoryId || '',
        is_required: true,
        placeholder: '',
        help_text: '',
        default_value: '',
        description: '',
        section: '',
        validation: {},
        options: [],
        order_index: 0,
      });
      setSelectedType('text');
      setOptions([]);
    }
  }, [column, categoryId, form]);

  // Update form when column type changes
  useEffect(() => {
    console.log('Type changed to:', selectedType);
    form.setValue('type', selectedType);
    
    // Clear options when switching to a non-option type
    if (!['select', 'radio', 'checkbox', 'multiselect'].includes(selectedType)) {
      setOptions([]);
      form.setValue('options', []);
    }
  }, [selectedType, form]);

  // Handle type change
  const onTypeChange = (type: ColumnType) => {
    console.log('onTypeChange called with:', type);
    setSelectedType(type);
  };

  // Add a new option
  const addOption = () => {
    console.log('addOption called with:', newOption);
    if (!newOption.label || !newOption.value) return;
    
    const newOptionWithId: ColumnOption = {
      id: crypto.randomUUID(),
      label: newOption.label || '',
      value: newOption.value || '',
    };
    
    const updatedOptions = [...options, newOptionWithId];
    console.log('Adding option, updated options:', updatedOptions);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
    setNewOption({ label: '', value: '' });
  };

  // Remove an option
  const removeOption = (optionId: string) => {
    console.log('removeOption called with:', optionId);
    const updatedOptions = options.filter(opt => opt.id !== optionId);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  };

  // Form submission handler
  const onSubmit = async (data: ColumnFormValues): Promise<boolean> => {
    console.log('onSubmit called with data:', data);
    setIsLoading(true);
    
    try {
      // Ensure options are set for types that need them
      if (['select', 'radio', 'checkbox', 'multiselect'].includes(data.type) && (!data.options || data.options.length === 0)) {
        console.error('Options required for type:', data.type);
        toast.error('This field type requires at least one option');
        setIsLoading(false);
        return false;
      }

      // Ensure category_id is set
      if (!data.category_id) {
        console.error('Category ID is required');
        toast.error('Category is required');
        setIsLoading(false);
        return false;
      }

      console.log('Calling onSave function...');
      if (onSave) {
        // Use the provided save function
        const result = await onSave(data);
        console.log('onSave result:', result);
        setIsLoading(false);
        return result;
      }
      
      console.log('No onSave function provided, using default database logic');
      // Default database logic
      const dbData = {
        name: data.name,
        type: data.type,
        category_id: data.category_id,
        is_required: data.is_required,
        placeholder: data.placeholder,
        help_text: data.help_text,
        default_value: data.default_value,
        validation: data.validation ? JSON.stringify(data.validation) : null,
        options: data.options ? JSON.stringify(data.options) : null,
        order_index: data.order_index || 0,
      };

      console.log('Prepared database data:', dbData);

      if (column?.id) {
        console.log('Updating existing column:', column.id);
        // Update existing column
        const { error } = await supabase
          .from('columns')
          .update({
            ...dbData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', column.id);

        if (error) throw error;
        toast.success('Column updated successfully');
        return true;
      } else {
        console.log('Creating new column');
        // Create new column
        const { error } = await supabase
          .from('columns')
          .insert(dbData);

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
