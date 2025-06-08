
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Column } from '@/types/column';
import { useSectorDataEntry } from '@/hooks/dataEntry/sector/useSectorDataEntry';
import FormFields from '../core/FormFields';
import { toast } from 'sonner';

interface SectorDataEntryFormProps {
  categoryId: string;
  sectorId: string;
  columns: Column[];
  onComplete?: () => void;
}

const SectorDataEntryForm: React.FC<SectorDataEntryFormProps> = ({
  categoryId,
  sectorId,
  columns,
  onComplete
}) => {
  const {
    formData,
    isLoading,
    isSaving,
    isSubmitting,
    hasUnsavedChanges,
    completionPercentage,
    errors,
    isValid,
    updateEntry,
    saveEntries,
    submitEntries,
    resetForm
  } = useSectorDataEntry({
    sectorId,
    categoryId,
    onSave: (entries) => {
      console.log('Sector data saved:', entries);
      toast.success('Sektor məlumatları yadda saxlanıldı');
    },
    onSubmit: (entries) => {
      console.log('Sector data submitted:', entries);
      toast.success('Sektor məlumatları təsdiq üçün göndərildi');
      if (onComplete) onComplete();
    }
  });

  const handleFieldChange = (columnId: string, value: any) => {
    updateEntry(columnId, value);
  };

  const handleSave = async () => {
    try {
      await saveEntries();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Yadda saxlama xətası');
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error('Formu göndərməzdən əvvəl xətaları düzəldin');
      return;
    }

    try {
      await submitEntries();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Göndərmə xətası');
    }
  };

  // Get validation errors
  const validationErrors = Object.entries(errors).map(([field, message]) => ({
    field,
    message
  }));

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Sektor Məlumat Forması
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage}% tamamlandı
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Yadda saxlanmamış dəyişikliklər
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Xətalar ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">
                  • {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FormFields
              columns={columns}
              formData={formData}
              onChange={handleFieldChange}
              readOnly={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Form keçərlidir</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{validationErrors.length} xəta</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saxlanılır...' : 'Saxla'}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isValid}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorDataEntryForm;
