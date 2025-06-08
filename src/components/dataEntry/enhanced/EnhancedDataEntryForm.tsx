
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Column } from '@/types/column';
import { useRealTimeValidation } from '@/hooks/dataEntry/useRealTimeValidation';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import FormFields from '../core/FormFields';
import { toast } from 'sonner';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationWarning {
  field: string;
  message: string;
}

interface EnhancedDataEntryFormProps {
  categoryId: string;
  schoolId: string;
  columns: Column[];
  initialData?: Record<string, any>;
  onSave?: (data: Record<string, any>) => Promise<void>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  onFieldChange?: (columnId: string, value: any) => void;
  readOnly?: boolean;
  autoSave?: boolean;
}

const EnhancedDataEntryForm: React.FC<EnhancedDataEntryFormProps> = ({
  categoryId,
  schoolId,
  columns,
  initialData = {},
  onSave,
  onSubmit,
  onFieldChange,
  readOnly = false,
  autoSave = true
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Real-time validation
  const { errors, isValid } = useRealTimeValidation({
    columns,
    data: formData
  });

  // Auto-save functionality
  useAutoSave({
    formData: formData,
    isDataModified: hasUnsavedChanges,
    enabled: autoSave && !readOnly
  });

  // Update form data when initial data changes
  useEffect(() => {
    setFormData(initialData);
    setHasUnsavedChanges(false);
  }, [initialData]);

  const handleFieldChange = (columnId: string, value: any) => {
    if (readOnly) return;

    // Update local form state
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
    setHasUnsavedChanges(true);

    // Call parent onChange if provided (for database sync)
    if (onFieldChange) {
      onFieldChange(columnId, value);
    }
  };

  const handleSave = async () => {
    if (!onSave || isSaving) return;

    try {
      setIsSaving(true);
      await onSave(formData);
      setHasUnsavedChanges(false);
      toast.success('Məlumatlar yadda saxlanıldı');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Yadda saxlama xətası');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit || isSubmitting) return;

    if (!isValid) {
      toast.error('Formu göndərməzdən əvvəl xətaları düzəldin');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success('Məlumatlar təsdiq üçün göndərildi');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Göndərmə xətası');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    if (columns.length === 0) return 0;
    
    const filledFields = columns.filter(column => {
      const value = formData[column.id];
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    return Math.round((filledFields / columns.length) * 100);
  }, [columns, formData]);

  // Get validation errors and warnings
  const validationErrors: ValidationError[] = Object.entries(errors).map(([field, message]) => ({
    field,
    message
  }));

  const validationWarnings: ValidationWarning[] = []; // Placeholder for warnings

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Məlumat Daxil Etmə Forması
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
          <FormFields
            columns={columns}
            formData={formData}
            onChange={handleFieldChange}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && (
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
      )}
    </div>
  );
};

export default EnhancedDataEntryForm;
