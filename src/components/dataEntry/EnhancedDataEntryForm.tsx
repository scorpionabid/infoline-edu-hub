import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Send, AlertCircle, CheckCircle, FileText, Clock, HelpCircle, Lightbulb } from 'lucide-react';
import { useUnifiedDataEntry, UseUnifiedDataEntryOptions } from '@/hooks/dataEntry/useUnifiedDataEntry';
import FormFields from './core/EnhancedFormFields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  onSave,
  onSubmit,
  title = 'Məlumat Daxil Etmə Forması',
  description,
  readOnly = false,
  showActions = true
}) => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const {
    columns,
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
    submitEntries
  } = useUnifiedDataEntry({
    categoryId,
    entityId,
    entityType,
    onSave,
    onSubmit
  });

  const handleFieldChange = (columnId: string, value: any) => {
    if (!readOnly) {
      updateEntry(columnId, value);
      
      // Auto-save functionality
      if (autoSaveEnabled) {
        setTimeout(() => {
          handleAutoSave();
        }, 2000);
      }
    }
  };

  const handleAutoSave = async () => {
    if (!readOnly && !isSaving && hasUnsavedChanges) {
      await saveEntries();
      setLastSaved(new Date());
    }
  };

  const handleSave = async () => {
    if (!readOnly && !isSaving) {
      await saveEntries();
      setLastSaved(new Date());
    }
  };

  const handleSubmit = async () => {
    if (!readOnly && !isSubmitting && isValid) {
      await submitEntries();
    }
  };

  // Group columns by sections (for better organization)
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

  if (isLoading) {
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
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Status Header */}
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
                
                {/* Progress Information */}
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
                {autoSaveEnabled && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-green-600">
                        Auto-save
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Dəyişikliklər avtomatik saxlanılır</TooltipContent>
                  </Tooltip>
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

        {/* Organized Form Sections */}
        <Card>
          <CardContent className="pt-6">
            <Accordion 
              type="multiple" 
              value={expandedSections}
              onValueChange={setExpandedSections}
              className="space-y-4"
            >
              {/* Required Fields Section */}
              {groupedColumns.required.length > 0 && (
                <AccordionItem value="required" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Məcburi sahələr</span>
                      <Badge variant="outline">{groupedColumns.required.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <FormFields
                        columns={groupedColumns.required}
                        formData={formData}
                        onChange={handleFieldChange}
                        readOnly={readOnly}
                        showValidation={true}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Optional Fields Section */}
              {groupedColumns.optional.length > 0 && (
                <AccordionItem value="optional" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Əlavə sahələr</span>
                      <Badge variant="outline">{groupedColumns.optional.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <FormFields
                        columns={groupedColumns.optional}
                        formData={formData}
                        onChange={handleFieldChange}
                        readOnly={readOnly}
                        showValidation={true}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>

        {/* Enhanced Action Buttons */}
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
    </TooltipProvider>
  );
};

export default EnhancedDataEntryForm;
