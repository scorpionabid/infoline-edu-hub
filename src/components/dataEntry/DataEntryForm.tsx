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
  const { isSchoolAdmin, canViewSectorCategories, isSectorAdmin, isRegionAdmin, isSuperAdmin } = usePermissions();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'save' | 'submit' }>({
    open: false,
    action: 'save'
  });

  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);

  const { 
    categories = [], 
    loading, 
    error,
    refreshCategories
  } = useCategoryData(schoolId);

  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [isDataModified, setIsDataModified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingCategories, setProcessingCategories] = useState<CategoryWithColumns[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const processedCategories = categories.map(category => {
        const filteredColumns = category.columns.filter(column => 
          column.status === 'active' || column.status === undefined
        );
        
        const sortedColumns = [...filteredColumns].sort((a, b) => 
          (a.order_index || 0) - (b.order_index || 0)
        );
        
        return {
          ...category,
          columns: sortedColumns
        };
      });
      
      setProcessingCategories(processedCategories);
    }
  }, [categories]);

  const filteredCategories = processingCategories.filter(category => {
    if (isSuperAdmin || isRegionAdmin) {
      return true;
    }
    
    if (isSectorAdmin) {
      return category.assignment === 'sectors' || category.assignment === 'all';
    }
    
    if (isSchoolAdmin) {
      return category.assignment === 'all';
    }
    
    return category.assignment === 'all';
  });

  const selectedCategory = filteredCategories.find(c => c.id === activeTab);

  useEffect(() => {
    if (categoryId && categoryId !== activeTab) {
      setActiveTab(categoryId);
    } else if (!categoryId && filteredCategories.length > 0) {
      const firstCategoryId = filteredCategories[0].id;
      setActiveTab(firstCategoryId);
      
      if (schoolId) {
        navigate(`/data-entry/${schoolId}/${firstCategoryId}`);
      }
    }
  }, [categoryId, activeTab, filteredCategories, navigate, schoolId]);

  useEffect(() => {
    const loadEntries = async () => {
      if (!schoolId || !activeTab) return;

      try {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', schoolId)
          .eq('category_id', activeTab);

        if (error) {
          console.error('Məlumatları yükləyərkən xəta:', error);
          throw error;
        }
        
        console.log(`${activeTab} kateqoriyası üçün ${data?.length || 0} məlumat yükləndi`);
        setEntries(data || []);
        setIsDataModified(false);
      } catch (err) {
        console.error('Məlumatları yükləyərkən xəta:', err);
        toast.error(t('errorLoadingData'));
      }
    };

    loadEntries();
  }, [schoolId, activeTab, t]);

  const handleTabChange = useCallback((value: string) => {
    if (isDataModified) {
      setConfirmDialog({ open: true, action: 'save' });
      return;
    }
    
    navigate(`/data-entry/${schoolId}/${value}`);
    setActiveTab(value);
  }, [isDataModified, navigate, schoolId]);

  const handleEntriesChange = useCallback((updatedEntries: DataEntry[]) => {
    setEntries(updatedEntries);
    setIsDataModified(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!schoolId || !activeTab || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }

    setSaveStatus(DataEntrySaveStatus.SAVING);
    try {
      const { error: deleteError } = await supabase
        .from('data_entries')
        .delete()
        .eq('school_id', schoolId)
        .eq('category_id', activeTab);
        
      if (deleteError) {
        console.error('Məlumatları silmə xətası:', deleteError);
        throw deleteError;
      }
      
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
          
        if (insertError) {
          console.error('Məlumatları əlavə etmə xətası:', insertError);
          throw insertError;
        }
      }
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDataModified(false);
      toast.success(t('dataSavedSuccessfully'));
      
      setTimeout(() => {
        refreshCategories();
      }, 1000);
    } catch (error: any) {
      console.error('Məlumatları saxlayarkən xəta:', error);
      toast.error(error?.message || t('errorSavingData'));
      setSaveStatus(DataEntrySaveStatus.ERROR);
    } finally {
      setTimeout(() => {
        setSaveStatus(DataEntrySaveStatus.IDLE);
      }, 3000);
    }
  }, [schoolId, activeTab, entries, user?.id, t, refreshCategories]);

  const handleSubmitForApproval = useCallback(async () => {
    if (!schoolId || !activeTab || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }

    const selectedCat = filteredCategories.find(c => c.id === activeTab);
    
    if (!selectedCat) {
      toast.error(t('categoryNotFound'));
      return;
    }
    
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
      const { error: deleteError } = await supabase
        .from('data_entries')
        .delete()
        .eq('school_id', schoolId)
        .eq('category_id', activeTab);
        
      if (deleteError) throw deleteError;
      
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
      
      try {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'data_submission',
          title: t('dataSubmittedTitle'),
          message: t('dataSubmittedMessage', { category: selectedCat.name }),
          related_entity_id: activeTab,
          related_entity_type: 'category',
          is_read: false,
          priority: 'medium'
        });
      } catch (notifError) {
        console.error('Bildiriş yaradılarkən xəta:', notifError);
      }
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDataModified(false);
      toast.success(t('dataSubmittedSuccessfully'));
      
      setTimeout(() => {
        refreshCategories();
      }, 1000);
    } catch (error: any) {
      console.error('Məlumatları təqdim edərkən xəta:', error);
      toast.error(t('errorSubmittingData'));
      setSaveStatus(DataEntrySaveStatus.ERROR);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSaveStatus(DataEntrySaveStatus.IDLE);
      }, 3000);
    }
  }, [schoolId, activeTab, entries, user?.id, t, filteredCategories, refreshCategories]);

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({ ...confirmDialog, open: false });
  }, [confirmDialog]);

  const handleConfirmAction = useCallback(async () => {
    if (confirmDialog.action === 'save') {
      await handleSave();
    }
    
    setConfirmDialog({ ...confirmDialog, open: false });
  }, [confirmDialog, handleSave]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t('errorLoadingCategories')}: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          {t('noCategoriesFound')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t('dataEntry')}</h2>
          
          <div className="flex items-center gap-2">
            {saveStatus === DataEntrySaveStatus.SAVING && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </div>
            )}
            
            {saveStatus === DataEntrySaveStatus.SAVED && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('saved')}
              </div>
            )}
            
            {saveStatus === DataEntrySaveStatus.ERROR && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {t('error')}
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={!isDataModified || isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
            
            <Button 
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {t('submitForApproval')}
            </Button>
          </div>
        </div>
        
        <TabsList className="mb-4 w-full h-auto flex flex-wrap">
          {filteredCategories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="py-2 px-4 flex items-center gap-2"
            >
              {category.name}
              {category.assignment === 'sectors' && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {t('sectorOnly')}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {filteredCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="pt-4">
            <Card className="p-6">
              {category.columns.length > 0 ? (
                <FormFields 
                  category={category}
                  entries={entries}
                  onChange={handleEntriesChange}
                  disabled={isSubmitting}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    {t('noColumnsInCategory')}
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <CategoryConfirmationDialog 
        isOpen={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        title={t('unsavedChanges')}
        description={t('unsavedChangesDescription')}
        confirmText={t('save')}
        cancelText={t('discard')}
      />
    </div>
  );
};

export default DataEntryForm;
