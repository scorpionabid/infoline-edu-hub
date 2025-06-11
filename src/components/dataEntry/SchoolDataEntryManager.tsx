
import React from 'react';
import { useUnifiedDataEntry } from '@/hooks/dataEntry/useUnifiedDataEntry';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import AutoSaveIndicator from './core/AutoSaveIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  
  const {
    entries,
    columns,
    formData,
    loading,
    isSaving,
    isSubmitting,
    hasUnsavedChanges,
    completionPercentage,
    lastSaved,
    errors,
    isValid,
    validateForm,
    updateEntry,
    saveEntries,
    submitEntries,
    refreshData
  } = useUnifiedDataEntry({
    categoryId,
    entityId: schoolId,
    entityType: 'school',
    userId
  });
  
  // Auto-save functionality
  const autoSave = useAutoSave({
    categoryId,
    schoolId,
    formData,
    isDataModified: hasUnsavedChanges,
    enabled: true,
    onSaveSuccess: (savedAt) => {
      console.log('Auto-save successful at:', savedAt);
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  const handleManualSave = async () => {
    const result = await autoSave.saveNow();
    if (result.success) {
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar saxlanıldı'
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: 'Xəta',
        description: 'Zəhmət olmasa bütün məcburi sahələri doldurun',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await submitEntries();
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar təsdiq üçün göndərildi'
      });
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Göndərmə zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          <CardTitle>Məktəb Məlumat Daxiletməsi</CardTitle>
          <div className="text-sm text-muted-foreground">
            Tamamlanma: {completionPercentage}%
            {lastSaved && ` • Son saxlanma: ${new Date(lastSaved).toLocaleString()}`}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {columns.map((column) => (
            <div key={column.id} className="space-y-2">
              <label className="text-sm font-medium">
                {column.name}
                {column.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={formData[column.id] || ''}
                onChange={(e) => updateEntry(column.id, { 
                  column_id: column.id, 
                  value: e.target.value 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`${column.name} daxil edin`}
              />
              {errors[column.id] && (
                <p className="text-xs text-red-500">{errors[column.id]}</p>
              )}
            </div>
          ))}
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isValid || autoSave.isSaving}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
            </Button>
            <Button
              onClick={refreshData}
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
