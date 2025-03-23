import { useState, useCallback, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm, EntryValue, CategoryEntryData, ColumnValidationError } from '@/types/dataEntry';
import { toast } from '@/components/ui/use-toast';

// Mock kateqoriyalar və sütunlar
const mockCategories: CategoryWithColumns[] = [
  {
    id: "cat1",
    name: "Ümumi məlumatlar",
    description: "Məktəbin əsas statistik göstəriciləri haqqında məlumatlar",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün sonra
    columns: [
      { 
        id: "col1", 
        categoryId: "cat1", 
        name: "Şagird sayı", 
        type: "number", 
        isRequired: true, 
        order: 1, 
        status: "active",
        helpText: "Məktəbdə təhsil alan bütün şagirdlərin sayı", 
        validationRules: { minValue: 0, maxValue: 5000 }
      },
      { 
        id: "col2", 
        categoryId: "cat1", 
        name: "Müəllim sayı", 
        type: "number", 
        isRequired: true, 
        order: 2, 
        status: "active",
        helpText: "Məktəbdə çalışan bütün müəllimlərin sayı", 
        validationRules: { minValue: 0, maxValue: 500 }
      },
      { 
        id: "col3", 
        categoryId: "cat1", 
        name: "Sinif otaqlarının sayı", 
        type: "number", 
        isRequired: true, 
        order: 3, 
        status: "active",
        helpText: "Tədris məqsədlə istifadə olunan sinif otaqlarının sayı", 
        validationRules: { minValue: 0 }
      },
      { 
        id: "col4", 
        categoryId: "cat1", 
        name: "Kompüter otaqlarının sayı", 
        type: "number", 
        isRequired: false, 
        order: 4, 
        status: "active",
        helpText: "İnformatika dərsləri üçün nəzərdə tutulmuş kompüter otaqlarının sayı"
      }
    ]
  },
  {
    id: "cat2",
    name: "Tədris məlumatları",
    description: "Məktəbin tədris fəaliyyəti ilə bağlı məlumatlar",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 gün sonra
    columns: [
      { 
        id: "col5", 
        categoryId: "cat2", 
        name: "Tədris dili", 
        type: "select", 
        isRequired: true, 
        options: ["Azərbaycan", "Rus", "İngilis", "Qarışıq"], 
        order: 1, 
        status: "active",
        helpText: "Məktəbdə əsas tədris dili"
      },
      { 
        id: "col6", 
        categoryId: "cat2", 
        name: "Tədris proqramı", 
        type: "text", 
        isRequired: true, 
        order: 2, 
        status: "active",
        multiline: true,
        helpText: "Məktəbin istifadə etdiyi əsas tədris proqramı(ları)"
      },
      { 
        id: "col7", 
        categoryId: "cat2", 
        name: "Təhsil növü", 
        type: "select", 
        isRequired: true, 
        options: ["Tam orta", "Ümumi orta", "İbtidai", "Qarışıq"], 
        order: 3, 
        status: "active",
        helpText: "Məktəbdə verilən təhsilin növü"
      }
    ]
  },
  {
    id: "cat3",
    name: "İnfrastruktur",
    description: "Məktəb binası və infrastrukturu haqqında məlumatlar",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün sonra
    columns: [
      { 
        id: "col8", 
        categoryId: "cat3", 
        name: "İdman zalı", 
        type: "checkbox", 
        isRequired: false, 
        order: 1, 
        status: "active",
        placeholder: "Məktəbdə idman zalı mövcuddur",
        helpText: "İdman zalının olub-olmadığını qeyd edin"
      },
      { 
        id: "col9", 
        categoryId: "cat3", 
        name: "Kitabxana", 
        type: "checkbox", 
        isRequired: false, 
        order: 2, 
        status: "active",
        placeholder: "Məktəbdə kitabxana mövcuddur", 
        helpText: "Kitabxananın olub-olmadığını qeyd edin"
      },
      { 
        id: "col10", 
        categoryId: "cat3", 
        name: "Yeməkxana", 
        type: "checkbox", 
        isRequired: false, 
        order: 3, 
        status: "active",
        placeholder: "Məktəbdə yeməkxana mövcuddur", 
        helpText: "Yeməkxananın olub-olmadığını qeyd edin"
      },
      { 
        id: "col11", 
        categoryId: "cat3", 
        name: "Binanın vəziyyəti", 
        type: "select", 
        isRequired: true, 
        options: ["Əla", "Yaxşı", "Kafi", "Qənaətbəxş deyil"], 
        order: 4, 
        status: "active",
        helpText: "Məktəb binasının ümumi vəziyyətini qiymətləndirin"
      },
      { 
        id: "col12", 
        categoryId: "cat3", 
        name: "Son təmir tarixi", 
        type: "date", 
        isRequired: true, 
        order: 5, 
        status: "active",
        helpText: "Məktəbdə son təmir işlərinin aparıldığı tarix"
      }
    ]
  },
  {
    id: "cat4",
    name: "Digər məlumatlar",
    description: "Əlavə məlumatlar və qeydlər",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 gün sonra
    columns: [
      { 
        id: "col13", 
        categoryId: "cat4", 
        name: "Əlavə qeydlər", 
        type: "text", 
        isRequired: false, 
        order: 1, 
        status: "active",
        multiline: true,
        helpText: "Məktəb haqqında əlavə qeydlər və məlumatlar"
      },
      { 
        id: "col14", 
        categoryId: "cat4", 
        name: "Təklif və rəylər", 
        type: "text", 
        isRequired: false, 
        order: 2, 
        status: "active",
        multiline: true,
        helpText: "Tədris prosesinin inkişafı üçün təkliflər"
      }
    ]
  },
  {
    id: "cat5",
    name: "Yeni kateqoriya",
    description: "Bu kateqoriya yeni əlavə edilib və doldurulması tələb olunur",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün sonra
    columns: [
      { 
        id: "col15", 
        categoryId: "cat5", 
        name: "Yeni əlavə olunmuş field", 
        type: "text", 
        isRequired: true, 
        order: 1, 
        status: "active",
        helpText: "Bu field yeni əlavə olunub və mütləq doldurulmalıdır", 
      },
      { 
        id: "col16", 
        categoryId: "cat5", 
        name: "İkinci yeni field", 
        type: "select", 
        isRequired: true, 
        options: ["Seçim 1", "Seçim 2", "Seçim 3"], 
        order: 2, 
        status: "active",
        helpText: "Bu da yeni əlavə olunmuş seçim sahəsidir"
      }
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
    // Yeni əlavə olunmuş kateqoriyaları və yaxın müddəti olan kateqoriyaları öndə göstərmək
    const sortedCategories = [...mockCategories].sort((a, b) => {
      // Əvvəlcə deadline-a görə sıralama
      if (a.deadline && b.deadline) {
        const deadlineA = new Date(a.deadline);
        const deadlineB = new Date(b.deadline);
        return deadlineA.getTime() - deadlineB.getTime();
      } else if (a.deadline) {
        return -1; // a-nın deadline-ı var, öndə olmalıdır
      } else if (b.deadline) {
        return 1; // b-nin deadline-ı var, öndə olmalıdır
      }
      return 0;
    });
    
    setCategories(sortedCategories);
    
    // Vaxtı keçən və ya yaxınlaşan kategorya varsa, ona fokuslanmaq
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(now.getDate() + 3);

    const overdueOrUrgentCategoryIndex = sortedCategories.findIndex(category => {
      if (!category.deadline) return false;
      const deadlineDate = new Date(category.deadline);
      return deadlineDate <= threeDaysLater;
    });

    if (overdueOrUrgentCategoryIndex !== -1) {
      setCurrentCategoryIndex(overdueOrUrgentCategoryIndex);
    }

    // Real vəziyyətdə burada API-dən məlumatlar yüklənə bilər
    const initialEntries: CategoryEntryData[] = sortedCategories.map(category => ({
      categoryId: category.id,
      values: category.columns.map(column => ({
        columnId: column.id,
        value: getDefaultValueByType(column.type, column.defaultValue),
        status: 'pending'
      })),
      isCompleted: false,
      isSubmitted: false,
      completionPercentage: 0,
      approvalStatus: 'pending'
    }));

    setFormData(prev => ({
      ...prev,
      entries: initialEntries,
      lastSaved: new Date().toISOString()
    }));
    
    // Məlumatları yüklədikdən sonra validasiyanı işə salaq
    setTimeout(() => {
      validateForm();
    }, 500);
    
    // Konsol log məlumatı
    console.log("Forma məlumatları yükləndi");
  }, []);

  // Sütun tipinə görə ilkin dəyər təyin etmək
  const getDefaultValueByType = (type: string, defaultValue?: string) => {
    switch (type) {
      case 'number':
        return defaultValue ? Number(defaultValue) : '';
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
          newEntries[categoryIndex].values[valueIndex] = {
            ...newEntries[categoryIndex].values[valueIndex],
            value,
            status: 'pending'
          };
          
          // Əgər əvvəlcədən xəta var idisə, silək
          delete newEntries[categoryIndex].values[valueIndex].errorMessage;
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
      
      // Hər dəyişiklikdən sonra validasiya etmək
      setTimeout(() => {
        validateForm();
      }, 300);
      
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
            const valueObj = categoryEntry.values.find(v => v.columnId === column.id);
            const value = valueObj?.value;
            
            if (value === undefined || value === null || value === '') {
              newErrors.push({
                columnId: column.id,
                message: `"${category.name}" kateqoriyasında "${column.name}" doldurulmalıdır`
              });
              
              // Value obyektinə error mesajı əlavə edək
              if (valueObj) {
                valueObj.errorMessage = `${column.name} doldurulmalıdır`;
              }
            } else if (column.type === 'number' && column.validationRules) {
              const numValue = Number(value);
              
              if (isNaN(numValue)) {
                newErrors.push({
                  columnId: column.id,
                  message: `"${category.name}" kateqoriyasında "${column.name}" rəqəm olmalıdır`
                });
                
                if (valueObj) {
                  valueObj.errorMessage = `${column.name} rəqəm olmalıdır`;
                }
              } else {
                if (column.validationRules.minValue !== undefined && numValue < column.validationRules.minValue) {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" minimum ${column.validationRules.minValue} olmalıdır`
                  });
                  
                  if (valueObj) {
                    valueObj.errorMessage = `Minimum ${column.validationRules.minValue} olmalıdır`;
                  }
                }
                
                if (column.validationRules.maxValue !== undefined && numValue > column.validationRules.maxValue) {
                  newErrors.push({
                    columnId: column.id,
                    message: `"${category.name}" kateqoriyasında "${column.name}" maksimum ${column.validationRules.maxValue} olmalıdır`
                  });
                  
                  if (valueObj) {
                    valueObj.errorMessage = `Maksimum ${column.validationRules.maxValue} olmalıdır`;
                  }
                }
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
            isSubmitted: true,
            approvalStatus: 'pending'
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
      
      // Xəta olan ilk kateqoriyaya keçid
      const firstErrorIndex = errors.length > 0 
        ? categories.findIndex(cat => cat.columns.some(col => errors.some(err => err.columnId === col.id)))
        : -1;
        
      if (firstErrorIndex !== -1) {
        setCurrentCategoryIndex(firstErrorIndex);
      }
    }
  }, [validateForm, errors, categories]);

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
    const error = errors.find(err => err.columnId === columnId);
    if (error) return error.message;
    
    // Alternativ olaraq, entry məlumatlarından da xəta mesajını ala bilərik
    for (const entry of formData.entries) {
      const valueObj = entry.values.find(v => v.columnId === columnId);
      if (valueObj && valueObj.errorMessage) {
        return valueObj.errorMessage;
      }
    }
    
    return undefined;
  }, [errors, formData.entries]);

  // Excel şablonunu yükləmək
  const downloadExcelTemplate = useCallback(() => {
    // Burada real API çağırışı olmalıdır
    console.log("Excel şablonu yükləndi");
    
    toast({
      title: "Excel şablonu yükləndi",
      description: "Şablonu dolduraraq geri yükləyə bilərsiniz",
      variant: "default",
    });
  }, []);

  // Excel faylını yükləmək və məlumatları doldurmaq
  const uploadExcelData = useCallback((file: File) => {
    // Burada real API çağırışı olmalıdır
    console.log("Excel faylı yükləndi:", file.name);
    
    // Excel formatlaması və məlumatların doldurulması simulyasiyası
    const mockDataFromExcel: Record<string, any> = {
      "col1": 500,
      "col2": 45,
      "col3": 30,
      "col4": 2,
      "col5": "Azərbaycan",
      "col6": "Standart tədris proqramı",
      "col7": "Tam orta",
      "col8": true,
      "col9": true,
      "col10": true,
      "col11": "Yaxşı",
      "col12": new Date("2022-08-15"),
      "col15": "Excel ilə doldurulmuş məlumat",
      "col16": "Seçim 2"
    };
    
    setFormData(prev => {
      const newEntries = [...prev.entries];
      
      // Excel-dən alınan məlumatları forma daxil edirik
      Object.entries(mockDataFromExcel).forEach(([columnId, value]) => {
        const category = categories.find(cat => cat.columns.some(col => col.id === columnId));
        
        if (category) {
          const categoryIndex = newEntries.findIndex(entry => entry.categoryId === category.id);
          
          if (categoryIndex !== -1) {
            const valueIndex = newEntries[categoryIndex].values.findIndex(v => v.columnId === columnId);
            
            if (valueIndex !== -1) {
              newEntries[categoryIndex].values[valueIndex] = {
                ...newEntries[categoryIndex].values[valueIndex],
                value,
                status: 'pending'
              };
              
              // Xəta mesajını silirik
              delete newEntries[categoryIndex].values[valueIndex].errorMessage;
            } else {
              newEntries[categoryIndex].values.push({
                columnId,
                value,
                status: 'pending'
              });
            }
          }
        }
      });
      
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
      
      // Excel yüklənib bitdikdən sonra formanı validasiya etmək
      setTimeout(() => {
        validateForm();
      }, 500);
      
      return {
        ...prev,
        entries: newEntries,
        overallProgress,
        lastSaved: new Date().toISOString()
      };
    });
  }, [categories, validateForm]);

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
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData
  };
};
