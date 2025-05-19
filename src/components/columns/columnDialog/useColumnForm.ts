
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ColumnFormValues } from '@/types/column';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

export const useColumnForm = (initialData?: Partial<ColumnFormValues>, onComplete?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form setup
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'text',
      category_id: initialData?.category_id || '',
      is_required: initialData?.is_required !== undefined ? initialData.is_required : true,
      placeholder: initialData?.placeholder || '',
      help_text: initialData?.help_text || '',
      default_value: initialData?.default_value || '',
      description: initialData?.description || '',
      section: initialData?.section || '',
      validation: initialData?.validation || {},
      options: initialData?.options || [],
      order_index: initialData?.order_index || 0,
    },
  });

  // Form submission handler
  const handleSubmit = async (data: ColumnFormValues) => {
    setIsLoading(true);
    try {
      if (initialData?.id) {
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
            validation: data.validation,
            options: data.options,
            order_index: data.order_index || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Column updated successfully');
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
            validation: data.validation,
            options: data.options,
            order_index: data.order_index || 0,
          });

        if (error) throw error;
        toast.success('Column created successfully');
      }

      if (onComplete) onComplete();
    } catch (error: any) {
      console.error('Error saving column:', error);
      toast.error(error.message || 'Error saving column');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
};
