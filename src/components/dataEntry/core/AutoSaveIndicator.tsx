
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: Date | null;
  saveError: string | null;
  saveAttempts: number;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  onRetry: () => void;
  onResetError: () => void;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  autoSaveEnabled,
  lastSaveTime,
  saveError,
  saveAttempts,
  hasUnsavedChanges,
  onManualSave,
  onRetry,
  onResetError
}) => {
  const getStatusIcon = () => {
    if (isSaving) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (saveError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (hasUnsavedChanges) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isSaving) return 'Saxlanılır...';
    if (saveError) return 'Saxlama xətası';
    if (hasUnsavedChanges) return 'Saxlanmamış dəyişikliklər';
    return 'Yadda saxlanıldı';
  };

  const getStatusVariant = () => {
    if (saveError) return 'destructive';
    if (hasUnsavedChanges) return 'secondary';
    return 'default';
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <Badge variant={getStatusVariant()}>
                {getStatusText()}
              </Badge>
              {lastSaveTime && !isSaving && (
                <p className="text-xs text-muted-foreground mt-1">
                  Son saxlanma: {lastSaveTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {saveError && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="text-xs"
                >
                  Yenidən cəhd et
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onResetError}
                  className="text-xs"
                >
                  Xətanı sil
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={onManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-1"
            >
              <Save className="h-3 w-3" />
              İndi saxla
            </Button>
          </div>
        </div>
        
        {saveError && (
          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
            <p><strong>Xəta:</strong> {saveError}</p>
            {saveAttempts > 1 && (
              <p className="text-xs mt-1">Cəhd sayı: {saveAttempts}</p>
            )}
          </div>
        )}
        
        <div className="mt-2 text-xs text-muted-foreground">
          Auto-save: {autoSaveEnabled ? 'Aktiv' : 'Deaktiv'}
          {autoSaveEnabled && ' (30 saniyə interval)'}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoSaveIndicator;
