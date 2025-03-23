
import { useState, useCallback, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm, EntryValue, CategoryEntryData, ColumnValidationError } from '@/types/dataEntry';
import { toast } from '@/hooks/use-toast';

// Mock kateqoriyalar və sütunlar
const mockCategories: CategoryWithColumns[] = [
  {
    id: "cat1",
    name: "Ümumi məlumatlar",
    columns: [
      { id: "col1", categoryId: "cat1", name: "Şagird sayı", type: "number", isRequired: true, order: 1, status: "active" },
      { id: "col2", categoryId: "cat1", name: "Müəllim sayı", type: "number", isRequired: true, order: 2, status: "active" },
      { id: "col3", categoryId: "cat1", name: "Sinif otaqlarının sayı", type: "number", isRequired: true, order: 3, status: "active" },
      { id: "col4", categoryId: "cat1", name: "Kompüter otaqlarının sayı", type: "number", isRequired: false, order: 4, status: "active" }
    ]
  },
  {
    id: "cat2",
    name: "Tədris məlumatları",
    columns: [
      { id: "col5", categoryId: "cat2", name: "Tədris dili", type: "select", isRequired: true, options: ["Azərbaycan", "Rus", "İngilis"], order: 1, status: "active" },
      { id: "col6", categoryId: "cat2", name: "Tədris proqramı", type: "text", isRequired: true, order: 2, status: "active" },
      { id: "col7", categoryId: "cat2", name: "Təhsil növü", type: "select", isRequired: true, options: ["Tam orta", "Ümumi orta", "İbtidai"], order: 3, status: "active" }
    ]
  },
  {
    id: "cat3",
    name: "İnfrastruktur",
    columns: [
      { id: "col8", categoryId: "cat3", name: "İdman zalı", type: "checkbox", isRequired: false, order: 1, status: "active" },
      { id: "col9", categoryId: "cat3", name: "Kitabxana", type: "checkbox", isRequired: false, order: 2, status: "active" },
      { id: "col10", categoryId: "cat3", name: "Yeməkxana", type: "checkbox", isRequired: false, order: 3, status: "active" },
      { id: "col11", categoryId: "cat3", name: "Binanın vəziyyəti", type: "select", isRequired: true, options: ["Əla", "Yaxşı", "Kafi", "Qənaətbəxş deyil"], order: 4, status: "active" },
      { id: "col12", categoryId: "cat3", name: "Son təmir tarixi", type: "date", isRequired: true, order: 5, status: "active" }
    ]
  },
  {
    id: "cat4",
    name: "Digər məlumatlar",
    columns: [
      { id: "col13", categoryId: "cat4", name: "Əlavə qeydlər", type: "text", isRequired: false, order: 1, status: "active" },
      { id: "col14", categoryId: "cat4", name: "Təklif və rəylər", type: "text", isRequired: false, order: 2, status: "active" }
    ]
  }
];

export const useDataEntry = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [formData, setFormData] = useState<DataEntryForm>({
    formId: "form1",
    schoolId: "school1",
    entries: [],
    overallProgress: 0,
    status: 'draft'
  });
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Forma ilkin dəyərləri yükləmək
  useEffect(() => {
    // Real vəziyyətdə burada API-dən məlumatlar yüklənə bilər
    const initialEntries: CategoryEntryData[] = categories.map(category => ({
      categoryId: category.id,
      values: category.columns.map(column => ({
        columnId: column.id,
        value: getDefaultValueByType(column.type, column.defaultValue),
        status: 'pending'
      })),
      isCompleted: false,
      isSubmitted: false,
      completionPercentage: 0
    }));

    setFormData(prev => ({
      ...prev,
      entries: initialEntries,
      lastSaved: new Date().toISOString()
    }));
  }, [categories]);

  // Sütun tipinə görə ilkin dəyər təyin etmək
  const getDefaultValueByType = (type: string, defaultValue?: string) => {
    switch (type) {
      case 'number':
        return defaultValue ? Number(defaultValue) : 0;
      case 'checkbox':
        return defaultValue === 'true';
      case 'date':
        return defaultValue ? new Date(defaultValue) : '';
      case 'select':
        return defaultValue || '';
      default:
        return defaultValue || '';
    }
  };

  // Kateqoriya dəyişmək
  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
    }
  }, [categories.length]);

  // Dəyəri yeniləmək
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prev => {
      const newEntries = [...prev.entries];
      const categoryIndex = newEntries.findIndex(entry => entry.categoryId === categoryId);
      
      if (categoryIndex !== -1) {
        const valueIndex = newEntries[categoryIndex].values.findIndex(v => v.columnId === columnId);
        
        if (valueIndex !== -1) {
          newEntries[categoryIndex].values[valueIndex].value = value;
        } else {
          newEntries[categoryIndex].values.push({
            columnId,
            value,
            status: 'pending'
          });
        }
      }
      
      // Kateqoriya tamamlanma faizini yeniləmək
      newEntries.forEach(entry => {
        const category = categories.find(c => c.id === entry.categoryId);
        if (category) {
          const requiredColumns = category.columns.filter(col => col.isRequired);
          const filledRequiredValues = entry.values.filter(val => {
            const column = category.columns.find(col => col.id === val.columnId);
            return column?.isRequired && val.value !== '' && val.value !== null && val.value !== undefined;
          });
          
          entry.completionPercentage = requiredColumns.length > 0 
            ? (filledRequiredValues.length / requiredColumns.length) * 100 
            : 100;
          
          entry.isCompleted = entry.completionPercentage === 100;
        }
      });
      
      // Ümumi tamamlanma faizini yeniləmək
      const overallProgress = newEntries.reduce((sum, entry) => sum + entry.completionPercentage, 0) / newEntries.length;
      
      setIsAutoSaving(true);
      
      return {
        ...prev,
        entries: newEntries,
        overallProgress,
        lastSaved: new Date().toISOString()
      };
    });
  }, [categories]);

  // Auto saxlama simulyasiyası
  useEffect(() => {
    if (isAutoSaving) {
      const timer = setTimeout(() => {
        // Burada real API çağırışı olmalıdır
        console.log("Məlumatlar avtomatik saxlanıldı:", formData);
        setIsAutoSaving(false);
        
        toast({
          title: "Dəyişikliklər avtomatik saxlanıldı",
          variant: "default",
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [formData, isAutoSaving]);

  // Formanı validasiya etmək
  const validateForm = useCallback(() => {
    const newErrors: ColumnValidationError[] = [];
    
    categories.forEach(category => {
      const categoryEntry = formData.entries.find(entry => entry.categoryId === category.id);
      
      if (categoryEntry) {
        category.columns.forEach(column => {
          if (column.isRequired) {
            const value = categoryEntry.values.find(v => v.columnId === column.id)?.value;
            
            if (value === undefined || value === null || value === '') {
              newErrors.push({
                columnId: column.id,
                message: `${column.name} doldurulmalıdır`
              });
            } else if (column.type === 'number' && column.validationRules) {
              const numValue = Number(value);
              if (column.validationRules.minValue !== undefined && numValue < column.validationRules.minValue) {
                newErrors.push({
                  columnId: column.id,
                  message: `${column.name} minimum ${column.validationRules.minValue} olmalıdır`
                });
              }
              if (column.validationRules.maxValue !== undefined && numValue > column.validationRules.maxValue) {
                newErrors.push({
                  columnId: column.id,
                  message: `${column.name} maksimum ${column.validationRules.maxValue} olmalıdır`
                });
              }
            }
          }
        });
      }
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [categories, formData.entries]);

  // Təsdiq üçün göndərmək
  const submitForApproval = useCallback(() => {
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      
      // API çağırışı simulyasiyası
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          status: 'submitted',
          entries: prev.entries.map(entry => ({
            ...entry,
            isSubmitted: true
          }))
        }));
        
        setIsSubmitting(false);
        
        toast({
          title: "Məlumatlar təsdiq üçün göndərildi",
          description: "Məlumatlarınız sektor admininə göndərildi",
          variant: "default",
        });
      }, 2000);
    } else {
      toast({
        title: "Xəta",
        description: "Zəhmət olmasa bütün məcburi sahələri doldurun",
        variant: "destructive",
      });
    }
  }, [validateForm]);

  // Manuel saxlama (Save düyməsi üçün)
  const saveForm = useCallback(() => {
    // Burada real API çağırışı olmalıdır
    console.log("Məlumatlar manual saxlanıldı:", formData);
    
    toast({
      title: "Məlumatlar saxlanıldı",
      variant: "default",
    });
    
    setFormData(prev => ({
      ...prev,
      lastSaved: new Date().toISOString()
    }));
  }, [formData]);

  // Sütun üçün xəta mesajını almaq
  const getErrorForColumn = useCallback((columnId: string) => {
    return errors.find(err => err.columnId === columnId)?.message;
  }, [errors]);

  return {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    errors,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn
  };
};
