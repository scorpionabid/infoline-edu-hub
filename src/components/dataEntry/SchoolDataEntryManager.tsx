import React from 'react';
import { useDataEntryManager } from '@/hooks/dataEntry/useDataEntryManager';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import AutoSaveIndicator from './core/AutoSaveIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SchoolDataEntryManagerProps {
  schoolId: string;
  categoryId: string;
  userId?: string;
  onClose?: () => void;
  onComplete?: () => void;
}

const SchoolDataEntryManager: React.FC<SchoolDataEntryManagerProps> = ({
  schoolId,
  categoryId,
  userId
}) => {
  const { toast } = useToast();
  
  // Get real category data with ONLY ACTIVE columns
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('id', categoryId)
        .eq('columns.status', 'active') // FILTER: Only active columns
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });
  
  const {
    formData,
    isLoading,
    isSubmitting,
    isSaving,
    isDataModified,
    entryStatus,
    error,
    lastSaved,
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    loadData
  } = useDataEntryManager({
    categoryId,
    schoolId,
    userId, // userId parametrini ötürürük
    category,
    enableRealTime: true,
    autoSave: false
  });
  
  // Get columns from category
  const columns = category?.columns || [];
  
  // Auto-save functionality
  const autoSave = useAutoSave({
    categoryId,
    schoolId,
    formData,
    isDataModified,
    enabled: true,
    onSaveSuccess: (savedAt) => {
      console.log('Auto-save successful at:', savedAt);
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  const handleManualSave = async () => {
    const result = await handleSave();
    if (result.success) {
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar saxlanıldı'
      });
    }
  };
  
  const handleFormSubmit = async () => {
    const result = await handleSubmit();
    if (result.success) {
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar təsdiq üçün göndərildi'
      });
    } else {
      toast({
        title: 'Xəta',
        description: result.error || 'Göndərmə zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  };
  
  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [columns, formData]);
  
  if (isLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-600">Xəta: {error}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Kateqoriya tapılmadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-save status */}
      <AutoSaveIndicator
        isSaving={autoSave.isSaving}
        autoSaveEnabled={autoSave.autoSaveEnabled}
        lastSaveTime={autoSave.lastSaveTime}
        saveError={autoSave.saveError}
        saveAttempts={autoSave.saveAttempts}
        hasUnsavedChanges={autoSave.hasUnsavedChanges}
        onManualSave={handleManualSave}
        onRetry={() => autoSave.saveNow()}
        onResetError={autoSave.resetError}
      />
      
      {/* Main form */}
      <Card>
        <CardHeader>
          <CardTitle>{category.name} Məlumat Daxiletməsi</CardTitle>
          <div className="text-sm text-muted-foreground">
            Tamamlanma: {completionPercentage}%
            {lastSaved && ` • Son saxlanma: ${new Date(lastSaved).toLocaleString()}`}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {columns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bu kateqoriya üçün sahə tapılmadı</p>
            </div>
          ) : (
            columns.map((column) => (
              <div key={column.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {column.name}
                  {column.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                  value={formData[column.id] || ''}
                  onChange={(e) => handleFieldChange(column.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={column.placeholder || `${column.name} daxil edin`}
                  required={column.is_required}
                />
                {column.help_text && (
                  <p className="text-xs text-muted-foreground">{column.help_text}</p>
                )}
              </div>
            ))
          )}
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleFormSubmit}
              disabled={isSubmitting || autoSave.isSaving}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
            </Button>
            <Button
              onClick={handleManualSave}
              variant="outline"
              disabled={isSaving || autoSave.isSaving}
            >
              {isSaving ? 'Saxlanılır...' : 'İndi saxla'}
            </Button>
            <Button
              onClick={loadData}
              variant="ghost"
            >
              Yenilə
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolDataEntryManager;

/**
 * Bu komponent artıq aşağıdakı funksiyaları dəstəkləyir:
 * 
 * ✅ Real-time auto-save (30 saniyə interval)
 * ✅ Manual save funksionallığı
 * ✅ Error handling və retry logic
 * ✅ Auto-save status indicator
 * ✅ Improved user feedback
 * ✅ Form validation integration
 */
