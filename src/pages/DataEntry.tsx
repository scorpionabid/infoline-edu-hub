
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { AlertCircle, Save, ArrowLeft, PlusCircle, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Column {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  options?: string[];
  is_required: boolean;
  placeholder?: string;
  category_id: string;
  order_index: number;
}

interface DataEntryForm {
  categoryId: string;
  values: Record<string, any>;
}

const DataEntry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(formId || '');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Əgər URL-də formId varsa, onu avtomatik seçmək
  useEffect(() => {
    if (formId) {
      setSelectedCategoryId(formId);
    }
  }, [formId]);

  // Kateqoriyaları yükləmək
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        setCategories(data || []);
        
        if (data && data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err: any) {
        console.error('Kateqoriyaları yükləyərkən xəta:', err);
        setError(t('categoriesLoadError') || 'Kateqoriyaları yükləyərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [t]);

  // Seçilmiş kateqoriya dəyişdikdə sütunları yükləmək
  useEffect(() => {
    const loadColumns = async () => {
      if (!selectedCategoryId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', selectedCategoryId)
          .order('order_index', { ascending: true });

        if (error) throw error;

        setColumns(data || []);
        
        // Mövcud dəyərləri yükləmək
        loadExistingValues(selectedCategoryId);
      } catch (err: any) {
        console.error('Sütunları yükləyərkən xəta:', err);
        setError(t('columnsLoadError') || 'Sütunları yükləyərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    loadColumns();
  }, [selectedCategoryId, t]);

  // Mövcud dəyərləri yükləmək
  const loadExistingValues = async (categoryId: string) => {
    if (!user?.schoolId) return;

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', user.schoolId);

      if (error) throw error;

      if (data && data.length > 0) {
        const values: Record<string, any> = {};
        data.forEach(entry => {
          values[entry.column_id] = entry.value;
        });
        setFormData(values);
      } else {
        // Yeni başlanğıc üçün boş formData
        setFormData({});
      }
    } catch (err: any) {
      console.error('Mövcud dəyərləri yükləyərkən xəta:', err);
    }
  };

  // Form dəyərinin dəyişdirilməsi
  const handleValueChange = (columnId: string, value: any) => {
    setFormData(prev => ({
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
      // Əvvəlki məlumatları silmək
      const { error: deleteError } = await supabase
        .from('data_entries')
        .delete()
        .eq('category_id', selectedCategoryId)
        .eq('school_id', user.schoolId);

      if (deleteError) throw deleteError;

      // Yeni məlumatları əlavə etmək
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        school_id: user.schoolId,
        category_id: selectedCategoryId,
        column_id: columnId,
        value,
        status: 'pending',
        created_by: user.id
      }));

      if (entries.length > 0) {
        const { error: insertError } = await supabase
          .from('data_entries')
          .insert(entries);

        if (insertError) throw insertError;
      }

      toast({
        title: t('success') || 'Uğurlu',
        description: t('dataSaved') || 'Məlumatlar uğurla saxlanıldı',
      });
    } catch (err: any) {
      console.error('Məlumatları saxlayarkən xəta:', err);
      toast({
        title: t('error') || 'Xəta',
        description: t('dataSaveError') || 'Məlumatları saxlayarkən xəta baş verdi',
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
                        <div key={column.id} className="space-y-2">
                          <Label htmlFor={column.id}>
                            {column.name}
                            {column.is_required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          
                          {column.type === 'text' && (
                            <Input
                              id={column.id}
                              placeholder={column.placeholder}
                              value={formData[column.id] || ''}
                              onChange={(e) => handleValueChange(column.id, e.target.value)}
                            />
                          )}
                          
                          {column.type === 'number' && (
                            <Input
                              id={column.id}
                              type="number"
                              placeholder={column.placeholder}
                              value={formData[column.id] || ''}
                              onChange={(e) => handleValueChange(column.id, e.target.value)}
                            />
                          )}
                          
                          {column.type === 'textarea' && (
                            <Textarea
                              id={column.id}
                              placeholder={column.placeholder}
                              value={formData[column.id] || ''}
                              onChange={(e) => handleValueChange(column.id, e.target.value)}
                            />
                          )}
                          
                          {column.type === 'select' && column.options && (
                            <Select
                              value={formData[column.id] || ''}
                              onValueChange={(value) => handleValueChange(column.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={column.placeholder || t('select') || 'Seçin'} />
                              </SelectTrigger>
                              <SelectContent>
                                {column.options.map(option => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {column.type === 'date' && (
                            <DatePicker
                              id={column.id}
                              date={formData[column.id] ? new Date(formData[column.id]) : undefined}
                              onSelect={(date) => handleValueChange(column.id, date ? date.toISOString() : null)}
                            />
                          )}
                          
                          {column.description && (
                            <p className="text-sm text-muted-foreground">{column.description}</p>
                          )}
                        </div>
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
