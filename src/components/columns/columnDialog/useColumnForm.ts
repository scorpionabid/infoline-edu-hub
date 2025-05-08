
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Column, ColumnFormValues, ColumnOption, ColumnType } from '@/types/column';
import { v4 as uuidv4 } from 'uuid';

interface UseColumnFormProps {
  column?: Column | null;
  categoryId?: string;
  onSave: (columnData: Omit<Column, "id"> & { id?: string }) => Promise<boolean>;
}

export const useColumnForm = ({ column, categoryId, onSave }: UseColumnFormProps) => {
  const isEditMode = !!column;
  const [selectedType, setSelectedType] = useState<ColumnType>(column?.type || 'text');
  const [options, setOptions] = useState<ColumnOption[]>(column?.options || []);
  const [newOption, setNewOption] = useState<ColumnOption>({ id: uuidv4(), label: '', value: '' });
  const [isOptionsMode, setIsOptionsMode] = useState(false);

  const form = useForm<ColumnFormValues>({
    defaultValues: {
      name: column?.name || '',
      type: column?.type || 'text',
      category_id: column?.category_id || categoryId || '',
      is_required: column?.is_required ?? true,
      help_text: column?.help_text || '',
      placeholder: column?.placeholder || '',
      default_value: column?.default_value || '',
      options: column?.options || [],
      validation: column?.validation || {},
      status: column?.status || 'active',
      description: column?.description || '',
      order_index: column?.order_index || 0,
    },
  });

  // Sütun növü dəyişdikdə, options və default_value sahələrini sıfırla
  const onTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    form.setValue('type', type);

    // Reset options if changing from option-based type to non-option type
    if (!['select', 'radio', 'checkbox'].includes(type) && options.length > 0) {
      setOptions([]);
      form.setValue('options', []);
    }

    // Reset default value
    form.setValue('default_value', '');

    // For certain types, reset validation
    if (['select', 'radio', 'checkbox', 'file', 'image'].includes(type)) {
      form.setValue('validation', {});
    }
  };

  // Option əlavə etmək funksiyası
  const addOption = () => {
    if (newOption.label && newOption.value) {
      const updatedOptions = [...options, { ...newOption }];
      setOptions(updatedOptions);
      form.setValue('options', updatedOptions);
      setNewOption({ id: uuidv4(), label: '', value: '' });
    }
  };

  // Option silmək funksiyası
  const removeOption = (id: string) => {
    const updatedOptions = options.filter(option => option.id !== id);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  };

  // Form submit handler
  const onSubmit = async (data: ColumnFormValues) => {
    try {
      // Ensure category_id is set and is required
      const formData = {
        ...data,
        category_id: data.category_id || categoryId || '',
      };

      // Əgər sütun tipi seçimlərdən biridirsə, options sahəsini əlavə et
      if (['select', 'radio', 'checkbox'].includes(data.type)) {
        formData.options = options;
      } else {
        formData.options = [];
      }

      // Validation rule'ları düzəlt (boolean tipi string'ə çevrilməsin)
      if (formData.validation) {
        const validation = formData.validation;
        
        if (validation.required === true || validation.required === false) {
          validation.required = validation.required;
        }
        
        if (validation.email === true || validation.email === false) {
          validation.email = validation.email;
        }
        
        if (validation.url === true || validation.url === false) {
          validation.url = validation.url;
        }
        
        if (validation.tel === true || validation.tel === false) {
          validation.tel = validation.tel;
        }
      }

      const columnData = {
        ...(column?.id ? { id: column.id } : {}),
        ...formData,
      };

      // Sütunu yaddaşa ver və nəticəni qaytarın
      const success = await onSave(columnData);
      return success;
    } catch (error) {
      console.error('Error saving column:', error);
      return false;
    }
  };

  return {
    form,
    selectedType,
    onTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode,
    isOptionsMode,
    setIsOptionsMode,
    setOptions
  };
};
