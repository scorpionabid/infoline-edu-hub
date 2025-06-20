import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, AlertCircle, CheckCircle, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className?: string;
  compact?: boolean;
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
  onResetError,
  className,
  compact = false
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
    if (autoSaveEnabled) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isSaving) return 'Saxlanılır...';
    if (saveError) return `Saxlama xətası${saveAttempts > 1 ? ` (${saveAttempts} cəhd)` : ''}`;
    if (hasUnsavedChanges) return 'Saxlanmamış dəyişikliklər';
    if (lastSaveTime) return 'Yadda saxlanıldı';
    return autoSaveEnabled ? 'Auto-save aktiv' : 'Auto-save deaktiv';
  };

  const getStatusVariant = () => {
    if (saveError) return 'destructive';
    if (isSaving) return 'secondary';
    if (hasUnsavedChanges) return 'outline';
    return 'default';
  };

  const getBorderColor = () => {
    if (saveError) return 'border-l-red-500';
    if (isSaving) return 'border-l-blue-500';
    if (hasUnsavedChanges) return 'border-l-yellow-500';
    if (autoSaveEnabled) return 'border-l-green-500';
    return 'border-l-gray-300';
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 p-2 rounded border", getBorderColor(), className)}>
        {getStatusIcon()}
        <span className="text-xs text-muted-foreground">{getStatusText()}</span>
        {hasUnsavedChanges && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onManualSave}
            disabled={isSaving}
            className="h-6 px-2 text-xs"
          >
            <Save className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-l-4", getBorderColor(), className)}>
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
                  Son saxlanma: {lastSaveTime.toLocaleTimeString('az-AZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
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
                  className="text-xs h-7"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Yenidən cəhd et
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onResetError}
                  className="text-xs h-7"
                >
                  Xətanı sil
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant={hasUnsavedChanges ? "default" : "outline"}
              onClick={onManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-1 h-7"
            >
              <Save className="h-3 w-3" />
              İndi saxla
            </Button>
          </div>
        </div>
        
        {saveError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <p><strong>Xəta:</strong> {saveError}</p>
            {saveAttempts > 1 && (
              <p className="text-xs mt-1">Cəhd sayı: {saveAttempts}</p>
            )}
            <p className="text-xs mt-1 text-muted-foreground">
              Auto-save təkrar cəhd edəcək və ya manual saxlaya bilərsiniz.
            </p>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Auto-save: {autoSaveEnabled ? 'Aktiv' : 'Deaktiv'}</span>
            {autoSaveEnabled && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                3s interval
              </Badge>
            )}
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Dəyişikliklər var</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoSaveIndicator;