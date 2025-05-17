
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoSave } from '@/hooks/form/useAutoSave';
import { SaveIcon, CheckCircleIcon, CircleIcon } from 'lucide-react';
import DataEntryStatus from './DataEntryStatus';
import FormFields from './FormFields';
import DataEntrySaveBar from './DataEntrySaveBar';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { CategoryWithColumns, TabDefinition } from '@/types/category';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';

// Helper to group columns by section
const groupColumnsBySection = (columns: Column[]): { [key: string]: Column[] } => {
  return columns.reduce((acc: { [key: string]: Column[] }, column) => {
    const section = column.section || 'default';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(column);
    return acc;
  }, {});
};

// Convert grouped columns to tabs
const getTabsFromColumns = (columns: Column[]): TabDefinition[] => {
  const grouped = groupColumnsBySection(columns);
  
  return Object.keys(grouped).map((section, index) => ({
    id: section === 'default' ? 'general' : section,
    title: section === 'default' ? 'General' : section,
    columns: grouped[section]
  }));
};

// Create schema dynamically based on columns
const createSchema = (columns: Column[]): z.ZodObject<any> => {
  const shape: { [key: string]: z.ZodType<any> } = {};
  
  columns.forEach(column => {
    let field: z.ZodType<any> = z.any();
    
    if (column.is_required) {
      switch (column.type) {
        case 'text':
        case 'textarea':
          field = z.string().nonempty('This field is required');
          break;
        case 'number':
          field = z.number().or(z.string().transform(val => Number(val) || 0));
          break;
        case 'select':
          field = z.string().nonempty('Please select an option');
          break;
        case 'checkbox':
          field = z.boolean();
          break;
        case 'date':
          field = z.string().or(z.date());
          break;
        default:
          field = z.any();
      }
    } else {
      switch (column.type) {
        case 'text':
        case 'textarea':
        case 'select':
          field = z.string().optional();
          break;
        case 'number':
          field = z.number().optional().or(z.string().transform(val => val ? Number(val) : undefined));
          break;
        case 'checkbox':
          field = z.boolean().optional();
          break;
        case 'date':
          field = z.string().optional().or(z.date().optional());
          break;
        default:
          field = z.any().optional();
      }
    }
    
    shape[column.id] = field;
  });
  
  return z.object(shape);
};

interface DataEntryFormProps {
  schoolId?: string;
  categoryId?: string;
  onSaved?: () => void;
  onSubmitted?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  schoolId: propSchoolId, 
  categoryId: propCategoryId,
  onSaved,
  onSubmitted
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const params = useParams();
  const user = useAuthStore(state => state.user);
  
  // Use props or URL params
  const categoryId = propCategoryId || params.categoryId;
  const schoolId = propSchoolId || user?.school_id;
  
  const { category, loading, error, refetch } = useCategoryData(categoryId);
  
  const [activeTab, setActiveTab] = useState<string>('general');
  const [tabs, setTabs] = useState<TabDefinition[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingData, setExistingData] = useState<Record<string, any>>({});
  const [hasPendingSubmission, setHasPendingSubmission] = useState(false);
  
  // Create dynamic form schema
  const schema = category?.columns ? createSchema(category.columns) : z.object({});
  
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: existingData
  });
  
  const { reset, formState, handleSubmit } = methods;
  const { isDirty } = formState;
  
  // Setup tabs when category is loaded
  useEffect(() => {
    if (category?.columns) {
      const newTabs = getTabsFromColumns(category.columns);
      setTabs(newTabs);
      
      // Set active tab to the first tab
      if (newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      }
    }
  }, [category]);
  
  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!categoryId || !schoolId) return;
      
      try {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('category_id', categoryId)
          .eq('school_id', schoolId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Format data as { columnId: value }
          const formattedData: Record<string, any> = {};
          data.forEach(entry => {
            formattedData[entry.column_id] = entry.value;
          });
          
          setExistingData(formattedData);
          reset(formattedData);
          
          // Check if there's a pending submission
          const hasPending = data.some(entry => entry.status === 'pending');
          setHasPendingSubmission(hasPending);
        }
      } catch (err) {
        console.error('Error loading existing data:', err);
        toast.error('Mövcud məlumatları yükləyərkən xəta yarandı');
      }
    };
    
    loadExistingData();
  }, [categoryId, schoolId, reset]);
  
  const saveData = async () => {
    if (!categoryId || !schoolId) {
      toast.error('Məlumatları saxlamaq üçün tələb olunan məlumat əksikdir');
      return false;
    }
    
    const formData = methods.getValues();
    setSaving(true);
    
    try {
      // Process each field
      for (const columnId in formData) {
        const value = formData[columnId];
        
        // Skip undefined values
        if (value === undefined) continue;
        
        // Find if entry already exists
        const { data: existingEntries } = await supabase
          .from('data_entries')
          .select('id')
          .eq('category_id', categoryId)
          .eq('school_id', schoolId)
          .eq('column_id', columnId)
          .maybeSingle();
        
        if (existingEntries) {
          // Update existing entry
          await supabase
            .from('data_entries')
            .update({ 
              value: value !== null ? String(value) : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntries.id);
        } else {
          // Create new entry
          await supabase
            .from('data_entries')
            .insert({
              category_id: categoryId,
              school_id: schoolId,
              column_id: columnId,
              value: value !== null ? String(value) : null,
              status: 'pending',
              created_by: user?.id
            });
        }
      }
      
      onSaved?.();
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Məlumatları saxlayarkən xəta yarandı');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  // Set up auto-save
  const { isSaving, errorMessage } = useAutoSave({
    save: saveData,
    interval: 30000,
    successMessage: 'Məlumatlar avtomatik saxlandı'
  });
  
  const onSubmit = async (data: any) => {
    const saveResult = await saveData();
    if (!saveResult) return;
    
    setSubmitting(true);
    
    try {
      // Mark all entries for this category as pending
      await supabase
        .from('data_entries')
        .update({ status: 'pending' })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
      
      toast.success('Məlumatlar təsdiqlənmə üçün göndərildi');
      onSubmitted?.();
      setHasPendingSubmission(true);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Məlumatları göndərərkən xəta yarandı');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle API errors
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Kateqoriya məlumatlarını yükləyərkən xəta yarandı: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <Alert>
        <AlertDescription>
          Kateqoriya tapılmadı
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col space-y-4">
          {hasPendingSubmission && (
            <DataEntryStatus status="pending" />
          )}
          
          {tabs.length > 1 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full md:w-auto mb-4">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    {formState.errors && 
                     tab.columns?.some(column => formState.errors[column.id]) ? (
                      <CircleIcon className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {tabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  <FormFields 
                    columns={tab.columns || []} 
                    disabled={submitting || saving || isSaving}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <FormFields 
              columns={category.columns || []} 
              disabled={submitting || saving || isSaving}
            />
          )}
        </div>
        
        <DataEntrySaveBar 
          isDirty={isDirty}
          isSubmitting={submitting}
          isSaving={saving || isSaving}
          onSave={saveData}
          errors={!!Object.keys(formState.errors).length}
          isPendingApproval={hasPendingSubmission}
        />
      </form>
    </FormProvider>
  );
};

export default DataEntryForm;
