import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useDataEntryOperations } from '@/hooks/data-entry/useDataEntryOperations';
import { useCategories } from '@/hooks/categories/useCategories';
import { useColumns } from '@/hooks/columns/useColumns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DataEntryForm from '@/components/data-entry/DataEntryForm';

const DataEntry: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { categoryId, schoolId } = useParams<{ categoryId: string; schoolId: string }>();
  const user = useAuthStore(selectUser);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { categories, isLoading: categoriesLoading } = useCategories({
    assignment: 'all' // Changed from 'schools' to 'all'
  });
  
  const { columns, isLoading: columnsLoading } = useColumns({
    categoryId: categoryId || ''
  });

  const { createDataEntry, updateDataEntry } = useDataEntryOperations();

  useEffect(() => {
    if (!categoryId || !schoolId) {
      console.warn('Category ID or School ID is missing.');
      return;
    }
  }, [categoryId, schoolId]);

  const handleInputChange = (columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
  };

  const validateForm = () => {
    if (!categoryId || !schoolId) {
      toast.error(t('missingCategoryOrSchool') || 'Kateqoriya və ya məktəb seçilməyib');
      return false;
    }

    const requiredColumns = columns.filter(col => col.is_required);
    for (const column of requiredColumns) {
      if (!formData[column.id]) {
        toast.error(`${column.name} ${t('isRequired') || 'sahəsi tələb olunur'}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!categoryId || !schoolId || !user) return;

    setIsSubmitting(true);
    try {
      const entryData = {
        school_id: schoolId,
        category_id: categoryId,
        entries: Object.entries(formData).map(([columnId, value]) => ({
          column_id: columnId,
          value: String(value)
        })),
        status
      };

      await createDataEntry(entryData);
      
      toast.success(
        status === 'draft' 
          ? t('dataSavedAsDraft') || 'Məlumatlar layihə kimi saxlanıldı'
          : t('dataSubmittedForReview') || 'Məlumatlar yoxlanılmaq üçün göndərildi'
      );
      
      navigate('/data-entry');
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(t('dataSubmissionFailed') || 'Məlumat göndərilməsində xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading || columnsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading') || 'Yüklənir...'}</span>
      </div>
    );
  }

  const category = categories.find(cat => cat.id === categoryId);
  const categoryColumns = columns.filter(col => col.category_id === categoryId);

  if (!category) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">{t('categoryNotFound') || 'Kateqoriya tapılmadı'}</h2>
        <Button onClick={() => navigate('/data-entry')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDataEntry') || 'Məlumat Giriş Səhifəsinə Qayıt'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/data-entry')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back') || 'Geri'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntry') || 'Məlumat Girişi'}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataEntryForm
            columns={categoryColumns}
            formData={formData}
            onChange={setFormData}
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {t('saveAsDraft') || 'Layihə kimi saxla'}
            </Button>
            <Button
              onClick={() => handleSubmit('pending')}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t('submitForReview') || 'Yoxlanılmaq üçün göndər'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntry;
