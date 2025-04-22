
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryForm from './CategoryForm';
import CategoryConfirmationDialog from './CategoryConfirmationDialog';
import { DataEntrySaveStatus, DataEntry } from '@/types/dataEntry';
import { AlertTriangle, CheckCircle, Loader2, Save, Send } from 'lucide-react';
import FormFields from './FormFields';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useAuth } from '@/context/auth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const DataEntryForm: React.FC = () => {
  const { schoolId, categoryId } = useParams<{ schoolId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(categoryId || '');
  const { isSchoolAdmin, canViewSectorCategories } = usePermissions();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'save' | 'submit' }>({
    open: false,
    action: 'save'
  });

  // Kateqoriyalar və məlumatları yükləyirik
  const { 
    categories = [], 
    loading, 
    error,
    refreshCategories
  } = useCategoryData(schoolId);

  // Local state
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seçilmiş kateqoriyanı tapaq
  const selectedCategory = categories.find(c => c.id === activeTab);

  // Filter categories based on assignment for school admin
  const filteredCategories = categories.filter(category => {
    if (isSchoolAdmin && category.assignment === 'sectors') {
      return false;
    }
    
    if (canViewSectorCategories) {
      return true;
    }
    
    return category.assignment === 'all';
  });

  // İlk yükləməde yoxlayırıq
  useEffect(() => {
    if (categoryId && categoryId !== activeTab) {
      setActiveTab(categoryId);
    } else if (!categoryId && filteredCategories.length > 0) {
      // Əgər categoryId təyin edilməyibsə, ilk kateqoriyanı seçirik
      const firstCategoryId = filteredCategories[0].id;
      setActiveTab(firstCategoryId);
      
      if (schoolId) {
        navigate(`/data-entry/${schoolId}/${firstCategoryId}`);
      }
    }
  }, [categoryId, activeTab, filteredCategories, navigate, schoolId]);

  // Mövcud məlumatları yükləyirik
  useEffect(() => {
    const loadEntries = async () => {
      if (!schoolId || !activeTab) return;

      try {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', schoolId)
          .eq('category_id', activeTab);

        if (error) throw error;
        setEntries(data || []);
        setIsDataModified(false);
      } catch (err) {
        console.error('Məlumatları yükləyərkən xəta:', err);
      }
    };

    loadEntries();
  }, [schoolId, activeTab]);

  // Tab dəyişdikdə URL-i də yeniləyək
  const handleTabChange = useCallback((value: string) => {
    if (isDataModified) {
      setConfirmDialog({ open: true, action: 'save' });
      return;
    }
    
    navigate(`/data-entry/${schoolId}/${value}`);
    setActiveTab(value);
  }, [isDataModified, navigate, schoolId]);

  // Məlumatlar dəyişildikdə işləyən funksiya
  const handleEntriesChange = useCallback((updatedEntries: DataEntry[]) => {
    setEntries(updatedEntries);
    setIsDataModified(true);
  }, []);

  // Məlumatları saxlamaq üçün funksiya
  const handleSave = useCallback(async () => {
    if (!schoolId || !activeTab || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }

    setSaveStatus(DataEntrySaveStatus.SAVING);
    try {
      // Əvvəlcə köhnə məlumatları silirik (əgər varsa)
      const { error: deleteError } = await supabase
        .from('data_entries')
        .delete()
        .eq('school_id', schoolId)
        .eq('category_id', activeTab);
        
      if (deleteError) throw deleteError;
      
      // Yeni məlumatları əlavə edirik
      if (entries.length > 0) {
        const dataToInsert = entries.map(entry => ({
          school_id: schoolId,
          category_id: activeTab,
          column_id: entry.column_id,
          value: String(entry.value || ''),
          status: 'draft',
          created_by: user.id,
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('data_entries')
          .insert(dataToInsert);
          
        if (insertError) throw insertError;
      }
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDataModified(false);
      toast.success(t('dataSavedSuccessfully'));
      
      // Yenilə
      setTimeout(() => {
        refreshCategories();
      }, 1000);
    } catch (error: any) {
      console.error('Məlumatları saxlayarkən xəta:', error);
      toast.error(t('errorSavingData'));
      setSaveStatus(DataEntrySaveStatus.ERROR);
    } finally {
      setTimeout(() => {
        setSaveStatus(DataEntrySaveStatus.IDLE);
      }, 3000);
    }
  }, [schoolId, activeTab, entries, user?.id, t, refreshCategories]);

  // Təsdiq üçün göndərmək funksiyası
  const handleSubmitForApproval = useCallback(async () => {
    if (!schoolId || !activeTab || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }

    const selectedCat = categories.find(c => c.id === activeTab);
    
    if (!selectedCat) {
      toast.error(t('categoryNotFound'));
      return;
    }
    
    // Bütün məcburi sahələrin doldurulduğunu yoxlayırıq
    const requiredColumns = selectedCat.columns.filter(col => col.is_required);
    const requiredFieldsWithValues = requiredColumns.filter(col => 
      entries.some(entry => entry.column_id === col.id && entry.value)
    );
    
    if (requiredFieldsWithValues.length < requiredColumns.length) {
      toast.error(t('fillRequiredFields'));
      return;
    }
    
    setIsSubmitting(true);
    setSaveStatus(DataEntrySaveStatus.SAVING);
    
    try {
      // Əvvəlcə köhnə məlumatları silirik (əgər varsa)
      const { error: deleteError } = await supabase
        .from('data_entries')
        .delete()
        .eq('school_id', schoolId)
        .eq('category_id', activeTab);
        
      if (deleteError) throw deleteError;
      
      // Sonra yeni məlumatları əlavə edirik
      if (entries.length > 0) {
        const dataToInsert = entries.map(entry => ({
          school_id: schoolId,
          category_id: activeTab,
          column_id: entry.column_id,
          value: String(entry.value || ''),
          status: 'pending',
          created_by: user.id,
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('data_entries')
          .insert(dataToInsert);
          
        if (insertError) throw insertError;
      }
      
      setIsDataModified(false);
      toast.success(t('dataSubmittedSuccessfully') || 'Məlumatlar uğurla təqdim edildi');
      
      // Yenilə
      setTimeout(() => {
        refreshCategories();
      }, 1000);
    } catch (error: any) {
      console.error('Məlumatları göndərərkən xəta:', error);
      toast.error(t('errorSubmittingData'));
      setSaveStatus(DataEntrySaveStatus.ERROR);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSaveStatus(DataEntrySaveStatus.IDLE);
      }, 3000);
    }
  }, [schoolId, activeTab, categories, entries, user?.id, t, refreshCategories]);

  // Təsdiq dialoqlarını idarə edən funksiyalar
  const handleConfirmSave = async () => {
    await handleSave();
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleConfirmSubmit = async () => {
    await handleSubmitForApproval();
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Yüklənmə zamanı göstəriləcək komponent
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid gap-4 grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Xəta zamanı göstəriləcək komponent
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto" 
          onClick={() => refreshCategories()}
        >
          {t('tryAgain')}
        </Button>
      </Alert>
    );
  }

  // Kateqoriya tapılmadıqda göstəriləcək komponent
  if (!filteredCategories || filteredCategories.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertDescription>{t('noCategoriesAvailable')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {saveStatus === DataEntrySaveStatus.SAVED && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          <AlertDescription className="text-green-600">
            {t('dataSavedSuccessfully')}
          </AlertDescription>
        </Alert>
      )}
      
      {saveStatus === DataEntrySaveStatus.ERROR && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {t('errorSavingData')}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="h-auto p-1 overflow-x-auto max-w-screen-lg">
            {Array.isArray(filteredCategories) && filteredCategories.map((category) => {
              // Status rənglərini təyin edirik
              const statusClasses = {
                draft: "bg-yellow-500",
                pending: "bg-blue-500",
                approved: "bg-green-500",
                rejected: "bg-red-500",
                partial: "bg-orange-500"
              };
              
              const status = category.status || 'draft';
              const statusClass = statusClasses[status as keyof typeof statusClasses] || "";
              
              // Tamamlanma faizini hesablayırıq
              const completionPercentage = category.completionPercentage || 0;
              
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="relative py-3 px-4"
                >
                  <span>{category.name}</span>
                  
                  {/* Status və tamamlanma faizi */}
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    {status && (
                      <Badge variant="outline" className={`${statusClass} text-white`}>
                        {t(status)}
                      </Badge>
                    )}
                    
                    {category.deadline && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(category.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className="text-xs">
                      {completionPercentage}%
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {Array.isArray(filteredCategories) && filteredCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <CategoryForm
              category={category as CategoryWithColumns}
              isSaving={saveStatus === DataEntrySaveStatus.SAVING}
              isSubmitting={isSubmitting}
              isModified={isDataModified}
              onSave={handleSave}
              onSubmit={() => setConfirmDialog({ open: true, action: 'submit' })}
            />
            
            <Card className="border rounded-lg p-6 space-y-8">
              <FormFields
                category={category as CategoryWithColumns}
                entries={entries}
                onChange={handleEntriesChange}
                disabled={saveStatus === DataEntrySaveStatus.SAVING}
                loading={saveStatus === DataEntrySaveStatus.SAVING}
              />
              
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={saveStatus === DataEntrySaveStatus.SAVING || !isDataModified}
                  className="w-32"
                >
                  {saveStatus === DataEntrySaveStatus.SAVING ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveDraft')}
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => setConfirmDialog({ open: true, action: 'submit' })}
                  disabled={saveStatus === DataEntrySaveStatus.SAVING || isSubmitting}
                  className="w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('submit')}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <CategoryConfirmationDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.action === 'save' ? handleConfirmSave : handleConfirmSubmit}
        title={confirmDialog.action === 'save' ? t('saveChanges') : t('submitForApproval')}
        description={
          confirmDialog.action === 'save'
            ? t('saveChangesDescription')
            : t('submitForApprovalDescription')
        }
        confirmText={confirmDialog.action === 'save' ? t('save') : t('submit')}
        isLoading={saveStatus === DataEntrySaveStatus.SAVING}
      />
    </div>
  );
};

export default DataEntryForm;
