
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, FileText, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Column, CategoryWithColumns } from '@/types/column';
import { fetchCategoriesWithColumns, fetchSchoolDataEntries, saveDataEntryValue, saveAllCategoryData, submitCategoryForApproval, prepareExcelTemplateData } from '@/services/dataEntryService';
import FormField from '@/components/dataEntry/components/FormField';
import DataEntrySaveBar from '@/components/dataEntry/DataEntrySaveBar';
import { mapDbColumnTypeToAppType } from '@/utils/typeMappings';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface FormValues {
  [columnId: string]: any;
}

const DataEntry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  const categoryIdParam = searchParams.get('categoryId');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [formValues, setFormValues] = useState<Record<string, FormValues>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryIdParam || formId || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  // Auto-save parametrləri
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const AUTO_SAVE_DELAY = 5000; // 5 saniyə

  // Kateqoriyaları yükləmək
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const fetchedCategories = await fetchCategoriesWithColumns();

        if (fetchedCategories.length === 0) {
          setError(t('categoriesLoadError') || 'Kateqoriyaları yükləyərkən xəta baş verdi');
          return;
        }

        setCategories(fetchedCategories);
        
        const initialCategoryId = categoryIdParam || formId || fetchedCategories[0].id;
        setSelectedCategoryId(initialCategoryId);
      } catch (err: any) {
        console.error('Kateqoriyaları yükləyərkən xəta:', err);
        setError(t('categoriesLoadError') || 'Kateqoriyaları yükləyərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [t, categoryIdParam, formId]);

  // Məlumatları yükləmək
  useEffect(() => {
    const loadDataEntries = async () => {
      if (!user?.schoolId) return;

      try {
        const entriesByCategoryAndColumn = await fetchSchoolDataEntries(user.schoolId);
        
        const values: Record<string, FormValues> = {};
        
        Object.entries(entriesByCategoryAndColumn).forEach(([categoryId, columnEntries]) => {
          values[categoryId] = {};
          
          Object.entries(columnEntries).forEach(([columnId, entry]: [string, any]) => {
            values[categoryId][columnId] = entry.value;
          });
        });
        
        setFormValues(values);
        
        // Tamamlanma faizini hesablayaq
        calculateCompletionPercentage(selectedCategoryId, values);
      } catch (err: any) {
        console.error('Mövcud dəyərləri yükləyərkən xəta:', err);
        toast({
          title: t('error') || 'Xəta',
          description: t('dataLoadError') || 'Mövcud dəyərləri yükləyərkən xəta baş verdi',
          variant: 'destructive',
        });
      }
    };

    loadDataEntries();
  }, [user?.schoolId, categories]);

  // Tamamlanma faizini hesablamaq
  const calculateCompletionPercentage = (categoryId: string, values: Record<string, FormValues>) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const requiredColumns = category.columns.filter(c => c.is_required);
    if (requiredColumns.length === 0) {
      setCompletionPercentage(100);
      return;
    }

    const categoryValues = values[categoryId] || {};
    let filledRequiredCount = 0;

    requiredColumns.forEach(column => {
      const value = categoryValues[column.id];
      if (value !== undefined && value !== null && value !== '') {
        filledRequiredCount++;
      }
    });

    const percentage = (filledRequiredCount / requiredColumns.length) * 100;
    setCompletionPercentage(percentage);
  };

  // Seçilmiş kateqoriya dəyişdikdə URL-i və tamamlanma faizini yenilə
  useEffect(() => {
    if (selectedCategoryId) {
      calculateCompletionPercentage(selectedCategoryId, formValues);
      navigate(`/data-entry?categoryId=${selectedCategoryId}`, { replace: true });
    }
  }, [selectedCategoryId, formValues, navigate]);

  // Form dəyərinin dəyişdirilməsi
  const handleValueChange = (columnId: string, value: any) => {
    setFormValues(prev => {
      const updatedValues = {
        ...prev,
        [selectedCategoryId]: {
          ...(prev[selectedCategoryId] || {}),
          [columnId]: value
        }
      };
      
      // Auto-save funksiyasını başlat
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(columnId, value);
      }, AUTO_SAVE_DELAY);
      
      calculateCompletionPercentage(selectedCategoryId, updatedValues);
      
      return updatedValues;
    });
  };

  // Auto-save funksiyası
  const handleAutoSave = async (columnId: string, value: any) => {
    if (!user?.schoolId || !user?.id) return;
    
    try {
      setSaving(true);
      await saveDataEntryValue(
        user.schoolId,
        selectedCategoryId,
        columnId,
        value,
        user.id
      );
      setLastSaved(new Date().toISOString());
    } catch (err) {
      console.error('Auto-save xətası:', err);
    } finally {
      setSaving(false);
    }
  };

  // Manuel saxlama
  const handleSave = async () => {
    if (!user?.schoolId || !user?.id || !selectedCategoryId) {
      toast({
        title: t('error') || 'Xəta',
        description: t('missingRequiredData') || 'Tələb olunan məlumatlar çatışmır',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    
    try {
      const categoryValues = formValues[selectedCategoryId] || {};
      
      const result = await saveAllCategoryData(
        user.schoolId,
        selectedCategoryId,
        categoryValues,
        user.id
      );
      
      if (result.success) {
        toast({
          title: t('success') || 'Uğurlu',
          description: result.message || t('dataSaved') || 'Məlumatlar uğurla saxlanıldı',
        });
        
        setLastSaved(new Date().toISOString());
      } else {
        toast({
          title: t('error') || 'Xəta',
          description: result.message || t('dataSaveError') || 'Məlumatları saxlayarkən xəta baş verdi',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('Məlumatları saxlayarkən xəta:', err);
      toast({
        title: t('error') || 'Xəta',
        description: err.message || t('dataSaveError') || 'Məlumatları saxlayarkən xəta baş verdi',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Təsdiq üçün göndərmək
  const handleSubmit = async () => {
    if (!user?.schoolId || !user?.id || !selectedCategoryId) {
      toast({
        title: t('error') || 'Xəta',
        description: t('missingRequiredData') || 'Tələb olunan məlumatlar çatışmır',
        variant: 'destructive'
      });
      return;
    }

    if (completionPercentage < 100) {
      toast({
        title: t('warning') || 'Xəbərdarlıq',
        description: t('completeAllFieldsBeforeSubmit') || 'Təqdim etmədən əvvəl bütün məcburi sahələri doldurun',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Əvvəlcə bütün dəyişiklikləri saxla
      await handleSave();
      
      // Sonra təsdiq üçün göndər
      const result = await submitCategoryForApproval(
        selectedCategoryId,
        user.schoolId,
        user.id
      );
      
      if (result.success) {
        toast({
          title: t('success') || 'Uğurlu',
          description: result.message || t('dataSubmitted') || 'Məlumatlar təsdiq üçün uğurla göndərildi',
        });
      } else {
        toast({
          title: t('error') || 'Xəta',
          description: result.message || t('dataSubmitError') || 'Məlumatları təsdiq üçün göndərərkən xəta baş verdi',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('Məlumatları təsdiq üçün göndərərkən xəta:', err);
      toast({
        title: t('error') || 'Xəta',
        description: err.message || t('dataSubmitError') || 'Məlumatları təsdiq üçün göndərərkən xəta baş verdi',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Excel şablonu yükləmək
  const handleDownloadTemplate = () => {
    const category = categories.find(c => c.id === selectedCategoryId);
    if (!category) return;
    
    const templateData = prepareExcelTemplateData(category);
    
    // Excel kitabçası yarat
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([templateData.headers, ...templateData.rows]);
    
    // Sütun enini tənzimlə
    const columnWidths = [
      { wch: 36 }, // ID
      { wch: 30 }, // Column Name
      { wch: 15 }, // Type
      { wch: 10 }, // Required
      { wch: 30 }  // Value
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Excel faylına əlavə et
    XLSX.utils.book_append_sheet(workbook, worksheet, templateData.categoryName);
    
    // Faylı yarat və yüklə
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    saveAs(blob, `${templateData.categoryName}_Template.xlsx`);
    
    toast({
      title: t('success') || 'Uğurlu',
      description: t('templateDownloaded') || 'Excel şablonu yükləndi',
    });
  };

  // Excel datasını yükləmək
  const handleUploadData = async (file: File) => {
    try {
      if (!user?.schoolId || !user?.id) {
        toast({
          title: t('error') || 'Xəta',
          description: t('notAuthenticated') || 'İstifadəçi məlumatları tapılmadı',
          variant: 'destructive'
        });
        return;
      }
      
      const category = categories.find(c => c.id === selectedCategoryId);
      if (!category) {
        toast({
          title: t('error') || 'Xəta',
          description: t('categoryNotFound') || 'Kateqoriya tapılmadı',
          variant: 'destructive'
        });
        return;
      }
      
      // Faylı oxu
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // İlk worksheeti al
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Excel cədvəlini JavaScript obyektinə çevir
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
      
      if (jsonData.length === 0) {
        toast({
          title: t('error') || 'Xəta',
          description: t('noDataInExcel') || 'Excel faylında məlumat tapılmadı',
          variant: 'destructive'
        });
        return;
      }
      
      // Məlumatları formatla
      const values: FormValues = {};
      
      jsonData.forEach(row => {
        const columnId = row['ID'];
        const value = row['Value'];
        
        if (columnId && value !== undefined) {
          const column = category.columns.find(col => col.id === columnId);
          if (column) {
            // Sütun tipinə görə dəyəri çevir
            switch (column.type) {
              case 'number':
                values[columnId] = Number(value);
                break;
              case 'checkbox':
                values[columnId] = value === 'true' || value === true || value === 1 || value === '1';
                break;
              case 'date':
                values[columnId] = new Date(value).toISOString();
                break;
              default:
                values[columnId] = value;
            }
          }
        }
      });
      
      if (Object.keys(values).length === 0) {
        toast({
          title: t('warning') || 'Xəbərdarlıq',
          description: t('noValidDataInExcel') || 'Excel faylında keçərli məlumat tapılmadı',
          variant: 'warning'
        });
        return;
      }
      
      // Məlumatları formda göstər
      setFormValues(prev => ({
        ...prev,
        [selectedCategoryId]: {
          ...(prev[selectedCategoryId] || {}),
          ...values
        }
      }));
      
      // Məlumatları serverdə saxla
      const result = await saveAllCategoryData(
        user.schoolId,
        selectedCategoryId,
        values,
        user.id
      );
      
      if (result.success) {
        toast({
          title: t('success') || 'Uğurlu',
          description: t('excelDataImported', { count: result.savedCount }) || `${result.savedCount} məlumat uğurla idxal edildi`,
        });
        
        setLastSaved(new Date().toISOString());
        calculateCompletionPercentage(selectedCategoryId, {
          ...formValues,
          [selectedCategoryId]: { ...(formValues[selectedCategoryId] || {}), ...values }
        });
      } else {
        toast({
          title: t('error') || 'Xəta',
          description: result.message || t('excelImportError') || 'Excel məlumatlarını idxal edərkən xəta baş verdi',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('Excel məlumatlarını yükləyərkən xəta:', err);
      toast({
        title: t('error') || 'Xəta',
        description: err.message || t('excelImportError') || 'Excel məlumatlarını yükləyərkən xəta baş verdi',
        variant: 'destructive'
      });
    }
  };

  // UI-ni render et
  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p>{t('loading') || 'Yüklənir...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error') || 'Xəta'}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('goBack') || 'Geri qayıt'}
        </Button>
      </div>
    );
  }

  // Seçilmiş kateqoriyanın sütunlarını əldə et
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedCategoryValues = formValues[selectedCategoryId] || {};

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dataEntry') || 'Məlumat daxil edilməsi'}</h1>
          <p className="text-muted-foreground">
            {t('dataEntryDesc') || 'Kateqoriyaları seçərək məlumatları daxil edin'}
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('goBack') || 'Geri qayıt'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Kateqoriya siyahısı */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('categories') || 'Kateqoriyalar'}</CardTitle>
            <CardDescription>
              {t('selectCategoryDesc') || 'Məlumat daxil etmək üçün kateqoriya seçin'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Məlumat daxiletmə formu */}
        <Card className="md:col-span-3">
          {!selectedCategoryId ? (
            <CardContent className="flex flex-col items-center justify-center h-[500px]">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-center">
                {t('selectCategoryToStart') || 'Başlamaq üçün kateqoriya seçin'}
              </p>
              <p className="text-muted-foreground text-center mt-2">
                {t('selectCategoryToStartDesc') || 'Məlumat daxil etmək üçün sol paneldən bir kateqoriya seçin'}
              </p>
            </CardContent>
          ) : !selectedCategory ? (
            <CardContent className="flex flex-col items-center justify-center h-[500px]">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-center">
                {t('categoryNotFound') || 'Kateqoriya tapılmadı'}
              </p>
              <p className="text-muted-foreground text-center mt-2">
                {t('selectAnotherCategory') || 'Zəhmət olmasa başqa bir kateqoriya seçin'}
              </p>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>
                  {selectedCategory.name || t('dataForm') || 'Məlumat formu'}
                </CardTitle>
                <CardDescription>
                  {selectedCategory.description || 
                    t('fillRequiredFields') || 'Tələb olunan sahələri doldurun'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {selectedCategory.columns.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">
                          {t('noCategoriesFound') || 'Bu kateqoriya üçün sütunlar tapılmadı'}
                        </p>
                      </div>
                    ) : (
                      selectedCategory.columns.map(column => (
                        <FormField
                          key={column.id}
                          id={column.id}
                          label={column.name}
                          type={column.type}
                          required={column.is_required}
                          options={column.options || []}
                          placeholder={column.placeholder}
                          helpText={column.help_text}
                          value={selectedCategoryValues[column.id] || ''}
                          onChange={(value) => handleValueChange(column.id, value)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <DataEntrySaveBar
                  lastSaved={lastSaved || undefined}
                  isSaving={saving}
                  isSubmitting={submitting}
                  completionPercentage={completionPercentage}
                  onSave={handleSave}
                  onSubmit={handleSubmit}
                  onDownloadTemplate={handleDownloadTemplate}
                  onUploadData={handleUploadData}
                />
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DataEntry;
