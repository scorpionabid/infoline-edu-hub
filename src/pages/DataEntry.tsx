
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, FileText, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Column, CategoryWithColumns } from '@/types/column';
import { fetchCategoriesWithColumns, fetchSchoolDataEntries, saveDataEntryValue } from '@/services/dataEntryService';
import FormField from '@/components/dataEntry/components/FormField';
import { mapDbColumnTypeToAppType } from '@/utils/typeMappings';

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
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryIdParam || formId || '');
  const [formValues, setFormValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formDataLoaded, setFormDataLoaded] = useState(false);

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

  // Seçilmiş kateqoriya dəyişdikdə sütunları yükləmək
  useEffect(() => {
    const updateColumns = () => {
      if (!selectedCategoryId || !categories.length) return;
      
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category && category.columns) {
        // Tip konversiyasından əmin oluruq
        const typedColumns = category.columns.map(col => ({
          ...col,
          type: mapDbColumnTypeToAppType(col.type)
        }));
        
        setColumns(typedColumns);
        
        // Seçilmiş kateqoriya URL-dən fərqlidirsə, URL-i yeniləyirik
        if (categoryIdParam !== selectedCategoryId) {
          navigate(`/data-entry?categoryId=${selectedCategoryId}`, { replace: true });
        }
        
        // Əgər məlumatlar hələ yüklənməyibsə, yükləyirik
        if (!formDataLoaded && user?.schoolId) {
          loadExistingValues(selectedCategoryId);
        }
      }
    };

    updateColumns();
  }, [selectedCategoryId, categories, categoryIdParam, navigate, formDataLoaded, user]);

  // Mövcud dəyərləri yükləmək
  const loadExistingValues = async (categoryId: string) => {
    if (!user?.schoolId) return;

    try {
      // Bütün kateqoriyalar üçün məlumatları bir dəfə əldə edirik
      const entriesByCategoryAndColumn = await fetchSchoolDataEntries(user.schoolId);
      
      if (entriesByCategoryAndColumn && entriesByCategoryAndColumn[categoryId]) {
        // Dəyərləri formValues-a çeviririk
        const values: FormValues = {};
        
        Object.entries(entriesByCategoryAndColumn[categoryId]).forEach(([columnId, entryData]: [string, any]) => {
          values[columnId] = entryData.value;
        });
        
        setFormValues(values);
      } else {
        // Yeni başlanğıc üçün boş formValues
        setFormValues({});
      }
      
      setFormDataLoaded(true);
    } catch (err: any) {
      console.error('Mövcud dəyərləri yükləyərkən xəta:', err);
      toast({
        title: t('error') || 'Xəta',
        description: t('dataLoadError') || 'Mövcud dəyərləri yükləyərkən xəta baş verdi',
        variant: 'destructive',
      });
    }
  };

  // Form dəyərinin dəyişdirilməsi
  const handleValueChange = (columnId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  // Formu saxlamaq
  const handleSave = async () => {
    if (!user?.schoolId || !selectedCategoryId) {
      toast({
        title: t('error') || 'Xəta',
        description: t('missingRequiredData') || 'Tələb olunan məlumatlar çatışmır',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    
    try {
      // Bütün dəyişmiş dəyərləri saxlayırıq
      const savePromises = Object.entries(formValues).map(async ([columnId, value]) => {
        return saveDataEntryValue(
          user.schoolId!,
          selectedCategoryId,
          columnId,
          value,
          user.id
        );
      });
      
      const results = await Promise.all(savePromises);
      
      // Xətaları yoxlayırıq
      const errors = results.filter(result => !result.success);
      
      if (errors.length > 0) {
        // Xəta mesajlarını birləşdiririk
        const errorMessage = errors.map(err => err.message).join('\n');
        throw new Error(errorMessage);
      }

      toast({
        title: t('success') || 'Uğurlu',
        description: t('dataSaved') || 'Məlumatlar uğurla saxlanıldı',
      });
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

  // Əsas komponenti render etmək
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
          ) : (
            <>
              <CardHeader>
                <CardTitle>
                  {categories.find(c => c.id === selectedCategoryId)?.name || t('dataForm') || 'Məlumat formu'}
                </CardTitle>
                <CardDescription>
                  {categories.find(c => c.id === selectedCategoryId)?.description || 
                    t('fillRequiredFields') || 'Tələb olunan sahələri doldurun'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {columns.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">
                          {t('noCategoriesFound') || 'Bu kateqoriya üçün sütunlar tapılmadı'}
                        </p>
                      </div>
                    ) : (
                      columns.map(column => (
                        <FormField
                          key={column.id}
                          id={column.id}
                          label={column.name}
                          type={column.type}
                          required={column.is_required}
                          options={column.options || []}
                          placeholder={column.placeholder}
                          helpText={column.help_text}
                          value={formValues[column.id] || ''}
                          onChange={(value) => handleValueChange(column.id, value)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <div className="pt-6 mt-6 border-t flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving') || 'Saxlanılır...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('saveData') || 'Məlumatları saxla'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DataEntry;
