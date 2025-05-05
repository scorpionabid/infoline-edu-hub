
import { useState, useEffect } from 'react';
import { Column } from '@/types/columns';
import { ColumnOption } from '@/types/form';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface UseColumnFormProps {
  initialData?: Partial<Column>;
  categoryId: string;
  onSubmit: (data: Partial<Column>) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

export const useColumnForm = ({ initialData, categoryId, onSubmit, onClose }: UseColumnFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Column>>({
    name: '',
    type: 'text',
    help_text: '',
    is_required: false,
    placeholder: '',
    status: 'active',
    order_index: 0,
    options: [],
    validation: {},
    ...initialData,
  });
  const [optionsText, setOptionsText] = useState('');
  const [optionsArray, setOptionsArray] = useState<ColumnOption[]>([]);
  const [validationEnabled, setValidationEnabled] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { toast } = useToast();
  const { t } = useLanguage();

  // Başlanğıc options varsa onları text sahəsinə yerləşdiririk
  useEffect(() => {
    if (initialData?.options && Array.isArray(initialData.options)) {
      // JSON.parse errors ilə işləmək
      try {
        const options = initialData.options as ColumnOption[];
        setOptionsArray(options);
        const optionsString = options.map(opt => `${opt.label}:${opt.value}`).join('\n');
        setOptionsText(optionsString);
      } catch (e) {
        console.error('Options parse error:', e);
        setOptionsText('');
      }
    }
  }, [initialData?.options]);

  // Validation lə bağlı məlumatları aktivləşdiririk əgər varsa
  useEffect(() => {
    if (initialData?.validation && Object.keys(initialData.validation).length > 0) {
      setValidationEnabled(true);
    }
  }, [initialData?.validation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Xətaları təmizlə
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Xətaları təmizlə
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Type dəyişdikdə validation-ları sıfırlayırıq
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        validation: {},
        options: value === 'select' || value === 'checkbox' || value === 'radio' ? prev.options : [],
      }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleValidationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: value
      }
    }));
  };

  const handleOptionsChange = (text: string) => {
    setOptionsText(text);
    
    // Options-ları parse et
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const parsedOptions: ColumnOption[] = lines.map(line => {
      const [label, value] = line.split(':').map(part => part.trim());
      return {
        label: label || '',
        value: value || label || '',
      };
    });
    
    setOptionsArray(parsedOptions);
    setFormData(prev => ({
      ...prev,
      options: parsedOptions,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Ad tələb olunur
    if (!formData.name?.trim()) {
      newErrors.name = t('columnNameRequired');
    }
    
    // Select, radio və checkbox üçün seçimlər tələb olunur
    if ((formData.type === 'select' || formData.type === 'radio' || formData.type === 'checkbox') &&
        (!optionsArray.length || optionsArray.some(opt => !opt.label || !opt.value))) {
      newErrors.options = t('validOptionsRequired');
    }
    
    // Validasiya xətaları
    if (validationEnabled) {
      const validation = formData.validation || {};
      
      if (formData.type === 'number' || formData.type === 'range') {
        // Rəqəmlərin düzgün olduğunu yoxla
        if (validation.min !== undefined && validation.max !== undefined && Number(validation.min) > Number(validation.max)) {
          newErrors.min = t('minCannotBeGreaterThanMax');
        }
      }
      
      if (formData.type === 'text' || formData.type === 'textarea' || formData.type === 'email') {
        // Mətn uzunluğu yoxla
        if (validation.minLength !== undefined && validation.maxLength !== undefined &&
            Number(validation.minLength) > Number(validation.maxLength)) {
          newErrors.minLength = t('minLengthCannotBeGreaterThanMaxLength');
        }
      }
      
      if (validation.pattern && typeof validation.pattern === 'string') {
        try {
          new RegExp(validation.pattern);
        } catch (e) {
          newErrors.pattern = t('invalidRegexPattern');
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: t('validationError'),
        description: t('pleaseCheckFormErrors'),
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // final məlumatları hazırla
      const finalData: Partial<Column> = {
        ...formData,
        category_id: categoryId,
      };
      
      // Əgər validation aktiv deyilsə boş obyekt göndər
      if (!validationEnabled) {
        finalData.validation = {};
      }
      
      const result = await onSubmit(finalData);
      
      if (result.success) {
        toast({
          title: t('success'),
          description: result.message || t('columnSavedSuccessfully')
        });
        onClose();
      } else {
        toast({
          title: t('error'),
          description: result.message || t('errorSavingColumn'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sütunu yadda saxlarkən xəta:', error);
      toast({
        title: t('error'),
        description: t('errorSavingColumn'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToDate = (dateString: string | Date): Date => {
    if (dateString instanceof Date) {
      return dateString;
    }
    // Əgər dateString bir string isə, onu Date obektinə çeviririk
    return new Date(dateString);
  };

  const handleDeadlineChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        deadline: date // Date obyekti olaraq saxlayırıq
      }));
    } else {
      // date undefined olduqda
      setFormData(prev => {
        const newData = {...prev};
        delete newData.deadline;
        return newData;
      });
    }
  };

  return {
    formData,
    loading,
    errors,
    optionsText,
    optionsArray,
    validationEnabled,
    setValidationEnabled,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleValidationChange,
    handleOptionsChange,
    handleSubmit,
    handleDeadlineChange,
    convertToDate,
  };
};

export default useColumnForm;
