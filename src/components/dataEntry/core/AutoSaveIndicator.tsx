import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: Date | null;
  saveError: string | null;
  saveAttempts: number;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  onRetry?: () => void;
  onResetError?: () => void;
  className?: string;
}

/**
 * Təkmilləşdirilmiş Auto-Save Indicator Komponenti
 * 
 * Bu komponent auto-save statusunu göstərir və istifadəçiyə
 * məlumatların saxlanma vəziyyəti haqqında real-time məlumat verir
 */
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
  className
}) => {
  
  // Format last save time
  const formatLastSaveTime = (time: Date | null) => {
    if (!time) return 'Heç vaxt';
    
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'İndi';
    if (diffMinutes < 60) return `${diffMinutes} dəqiqə əvvəl`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} saat əvvəl`;
    
    return time.toLocaleDateString();
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (saveError) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Xəta {saveAttempts > 0 && `(${saveAttempts} cəhd)`}
        </Badge>
      );
    }
    
    if (isSaving) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3 animate-spin" />
          Saxlanılır...
        </Badge>
      );
    }
    
    if (hasUnsavedChanges) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3 text-orange-600" />
          Saxlanılmamış dəyişikliklər
        </Badge>
      );
    }
    
    if (lastSaveTime) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          Saxlanıldı {formatLastSaveTime(lastSaveTime)}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3 text-gray-400" />
        Saxlanılmayıb
      </Badge>
    );
  };
  
  // Get connection status
  const getConnectionStatus = () => {
    if (saveError) {
      return (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <WifiOff className="h-3 w-3" />
          Bağlantı problemi
        </div>
      );
    }
    
    if (autoSaveEnabled) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Wifi className="h-3 w-3" />
          Avtomatik saxlama aktiv
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <WifiOff className="h-3 w-3" />
        Avtomatik saxlama deaktiv
      </div>
    );
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Main status bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {getConnectionStatus()}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Retry button for errors */}
          {saveError && onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Yenidən cəhd et
            </Button>
          )}
          
          {/* Manual save button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onManualSave}
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            <Save className="h-3 w-3" />
            {isSaving ? 'Saxlanılır...' : 'İndi saxla'}
          </Button>
        </div>
      </div>
      
      {/* Error alert */}
      {saveError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Saxlama xətası: {saveError}
              {saveAttempts > 0 && ` (${saveAttempts} cəhd edildi)`}
            </span>
            {onResetError && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetError}
                className="text-xs"
              >
                Bağla
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Auto-save info */}
      {autoSaveEnabled && !saveError && (
        <div className="text-xs text-muted-foreground">
          Avtomatik saxlama 30 saniyə interval ilə işləyir
        </div>
      )}
    </div>
  );
};

export default AutoSaveIndicator;