
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useUnifiedDataEntry, type UseUnifiedDataEntryOptions } from '@/hooks/dataEntry/useUnifiedDataEntry';

export interface UnifiedDataEntryFormProps extends UseUnifiedDataEntryOptions {
  title?: string;
  description?: string;
  readOnly?: boolean;
  showActions?: boolean;
}

const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  categoryId,
  entityId,
  entityType,
  userId,
  onSave,
  onSubmit,
  title = 'Məlumat Daxil Etmə Forması',
  description,
  readOnly = false,
  showActions = true
}) => {
  const {
    columns,
    formData,
    loading,
    isSaving,
    isSubmitting,
    hasUnsavedChanges,
    completionPercentage,
    errors,
    isValid,
    updateEntry,
    saveEntries,
    submitEntries,
    lastSaved
  } = useUnifiedDataEntry({
    categoryId,
    entityId,
    entityType,
    userId,
    onSave,
    onSubmit
  });

  const handleFieldChange = (columnId: string, value: any) => {
    if (!readOnly) {
      // Find or create entry for this column
      const existingEntry = Object.keys(formData).find(key => key === columnId);
      if (existingEntry) {
        updateEntry(existingEntry, { value });
      } else {
        // Create new entry
        updateEntry(generateTempId(), {
          column_id: columnId,
          category_id: categoryId,
          value,
          status: 'draft'
        });
      }
    }
  };

  const handleSave = async () => {
    if (!readOnly && !isSaving) {
      await saveEntries();
    }
  };

  const handleSubmit = async () => {
    if (!readOnly && !isSubmitting && isValid) {
      await submitEntries();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Yüklənir...</div>
        </CardContent>
      </Card>
    );
  }

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
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
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
          <div className="space-y-4">
            {columns.map((column) => (
              <div key={column.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {column.name}
                  {column.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={formData[column.id] || ''}
                  onChange={(e) => handleFieldChange(column.id, e.target.value)}
                  placeholder={column.placeholder || `${column.name} daxil edin`}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {column.help_text && (
                  <p className="text-xs text-muted-foreground">{column.help_text}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && showActions && (
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

// Helper function
function generateTempId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default UnifiedDataEntryForm;
