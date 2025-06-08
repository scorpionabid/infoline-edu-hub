import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  Send, 
  CheckCircle, 
  Clock, 
  FileDown,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  Lightbulb
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface SmartFormActionsProps {
  isDirty: boolean;
  isValid: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  completionPercentage: number;
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  onDownloadTemplate?: () => void;
  onUploadData?: (file: File) => void;
  onReset?: () => void;
  lastSaved?: Date | null;
  autoSaveEnabled?: boolean;
  onAutoSaveToggle?: (enabled: boolean) => void;
  readOnly?: boolean;
}

export const SmartFormActions: React.FC<SmartFormActionsProps> = ({
  isDirty,
  isValid,
  isSaving,
  isSubmitting,
  completionPercentage,
  onSave,
  onSubmit,
  onDownloadTemplate,
  onUploadData,
  onReset,
  lastSaved,
  autoSaveEnabled = true,
  onAutoSaveToggle,
  readOnly = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeToSubmit, setTimeToSubmit] = useState<number | null>(null);

  // Estimate time to complete based on completion rate
  useEffect(() => {
    if (completionPercentage > 0 && completionPercentage < 100) {
      const estimatedMinutes = Math.ceil((100 - completionPercentage) * 0.5); // Rough estimate
      setTimeToSubmit(estimatedMinutes);
    } else {
      setTimeToSubmit(null);
    }
  }, [completionPercentage]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadData) {
      onUploadData(file);
      toast.success('Fayl yükləndi və emal olunur...');
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return 'Təsdiq edilir...';
    if (completionPercentage === 100) return 'Təsdiq üçün göndər';
    return `Əvvəl formu tamamla (${completionPercentage}%)`;
  };

  const getProgressColor = () => {
    if (completionPercentage >= 100) return 'bg-green-500';
    if (completionPercentage >= 75) return 'bg-blue-500';
    if (completionPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (readOnly) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Bu form yalnız oxu rejimindədir. Dəyişiklik edə bilməzsiniz.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-4 border-t-primary">
      <CardContent className="pt-6 space-y-4">
        {/* Progress Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Form tamamlanma vəziyyəti</span>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {completionPercentage}%
            </Badge>
          </div>
          
          <Progress 
            value={completionPercentage} 
            className="h-2"
            style={{ '--progress-background': getProgressColor() } as React.CSSProperties}
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completionPercentage === 100 
                ? 'Bütün sahələr tamamlandı!' 
                : `${100 - completionPercentage}% qalıb`
              }
            </span>
            {timeToSubmit && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{timeToSubmit} dəq qalıb
              </span>
            )}
          </div>
        </div>

        {/* Auto-save Status */}
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Son saxlanma: {lastSaved.toLocaleTimeString('az-AZ')}</span>
            {autoSaveEnabled && (
              <Badge variant="outline" className="text-xs">Auto-save</Badge>
            )}
          </div>
        )}

        {/* Validation Status */}
        {!isValid && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              Formu göndərməzdən əvvəl bütün məcburi sahələri doldurun və xətaları düzəldin.
            </AlertDescription>
          </Alert>
        )}

        {/* Smart Suggestions */}
        {completionPercentage > 0 && completionPercentage < 50 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Məsləhət:</strong> Excel şablonu yükləyərək məlumatları daha sürətli daxil edə bilərsiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isSaving || (!isDirty && !autoSaveEnabled)}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saxlanılır...' : 'Saxla'}
            </Button>

            <Button
              onClick={onSubmit}
              disabled={isSubmitting || !isValid}
              className="flex-2 min-w-[200px]"
              size="default"
            >
              <Send className="h-4 w-4 mr-2" />
              {getSubmitButtonText()}
            </Button>
          </div>

          {/* Advanced Actions Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onAutoSaveToggle && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => onAutoSaveToggle(e.target.checked)}
                    className="rounded"
                  />
                  Avtomatik saxlama
                </label>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showAdvanced ? 'Gizlət' : 'Əlavə seçimlər'}
            </Button>
          </div>

          {/* Advanced Actions */}
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t">
              {onDownloadTemplate && (
                <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
                  <FileDown className="h-3 w-3 mr-1" />
                  Excel şablonu
                </Button>
              )}

              {onUploadData && (
                <div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="upload-data"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('upload-data')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Excel yüklə
                  </Button>
                </div>
              )}

              {onReset && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReset}
                  className="col-span-2"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Formu sıfırla
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress Milestones */}
        {completionPercentage > 0 && (
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Başlanğıc</span>
                <span className={completionPercentage >= 25 ? 'text-green-600' : ''}>
                  25% {completionPercentage >= 25 && '✓'}
                </span>
                <span className={completionPercentage >= 50 ? 'text-green-600' : ''}>
                  50% {completionPercentage >= 50 && '✓'}
                </span>
                <span className={completionPercentage >= 75 ? 'text-green-600' : ''}>
                  75% {completionPercentage >= 75 && '✓'}
                </span>
                <span className={completionPercentage >= 100 ? 'text-green-600 font-medium' : ''}>
                  Tamamlandı {completionPercentage >= 100 && '🎉'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartFormActions;
