
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, Send, AlertCircle, CheckCircle, FileText, Clock, HelpCircle, Lightbulb } from 'lucide-react';
import { useUnifiedDataEntry, type UseUnifiedDataEntryOptions } from '@/hooks/dataEntry/useUnifiedDataEntry';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FormFieldComponent from './fields/FormFieldComponent';

export interface EnhancedDataEntryFormProps extends UseUnifiedDataEntryOptions {
  title?: string;
  description?: string;
  readOnly?: boolean;
  showActions?: boolean;
}

export const EnhancedDataEntryForm: React.FC<EnhancedDataEntryFormProps> = ({
  categoryId,
  entityId,
  entityType,
  userId,
  title = 'Məlumat Daxil Etmə Forması',
  description,
  readOnly = false,
  showActions = true
}) => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

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
    userId
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

  // Group columns by sections
  const groupedColumns = React.useMemo(() => {
    const groups: Record<string, typeof columns> = {
      required: columns.filter(col => col.is_required),
      optional: columns.filter(col => !col.is_required)
    };
    return groups;
  }, [columns]);

  const getFieldCompletionStatus = () => {
    const requiredFields = columns.filter(col => col.is_required);
    const completedRequired = requiredFields.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return {
      completed: completedRequired.length,
      total: requiredFields.length,
      percentage: requiredFields.length > 0 ? Math.round((completedRequired.length / requiredFields.length) * 100) : 100
    };
  };

  const fieldStatus = getFieldCompletionStatus();
  const validationErrors = Object.entries(errors).map(([field, message]) => ({ field, message }));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Yüklənir...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Progress value={fieldStatus.percentage} className="w-32" />
                  <span className="text-sm font-medium">{fieldStatus.completed}/{fieldStatus.total} məcburi sahə</span>
                </div>
                
                {lastSaved && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Son saxlanma: {lastSaved.toLocaleTimeString('az-AZ')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={fieldStatus.percentage === 100 ? "default" : "secondary"}>
                {fieldStatus.percentage}% tamamlandı
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 animate-pulse">
                  Saxlanmamış dəyişikliklər
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Aşağıdakı sahələrdə xətalar var:</div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">• {error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isValid && fieldStatus.percentage === 100 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <span>Bütün məcburi sahələr tamamlandı!</span>
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Required Fields */}
            {groupedColumns.required.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Məcburi sahələr</span>
                  <Badge variant="outline">{groupedColumns.required.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {groupedColumns.required.map((column) => (
                    <FormFieldComponent
                      key={column.id}
                      column={column}
                      value={formData[column.id] || ''}
                      onChange={(value) => handleFieldChange(column.id, value)}
                      disabled={readOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Optional Fields */}
            {groupedColumns.optional.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Əlavə sahələr</span>
                  <Badge variant="outline">{groupedColumns.optional.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {groupedColumns.optional.map((column) => (
                    <FormFieldComponent
                      key={column.id}
                      column={column}
                      value={formData[column.id] || ''}
                      onChange={(value) => handleFieldChange(column.id, value)}
                      disabled={readOnly}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && showActions && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isValid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Form təsdiqə hazırdır</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {validationErrors.length > 0 
                        ? `${validationErrors.length} xəta var` 
                        : `${fieldStatus.total - fieldStatus.completed} məcburi sahə qalıb`
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autosave"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autosave" className="text-sm text-muted-foreground">
                    Avtomatik saxlama
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || (!hasUnsavedChanges && !autoSaveEnabled)}
                  className="min-w-[120px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saxlanılır...' : 'Saxla'}
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isValid}
                  className="min-w-[160px]"
                  size="default"
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

export default EnhancedDataEntryForm;
