
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface AutoSaveIndicatorProps {
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime?: number;
  onManualSave?: () => void;
  className?: string;
}

/**
 * Auto Save Indicator komponenti - avtomatik saxlama statusunu göstərir
 */
const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  autoSaveEnabled,
  lastSaveTime,
  onManualSave,
  className = ''
}) => {
  const { t } = useLanguage();
  
  // Son saxlama vaxtını format edir
  const getLastSaveText = () => {
    if (!lastSaveTime) return t('notSavedYet');
    
    const now = Date.now();
    const diff = now - lastSaveTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return t('savedMinutesAgo', { minutes });
    } else if (seconds > 0) {
      return t('savedSecondsAgo', { seconds });
    } else {
      return t('justSaved');
    }
  };
  
  // Status icon və rəng təyin edir
  const getStatusContent = () => {
    if (isSaving) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: t('saving'),
        variant: 'secondary' as const
      };
    } else if (autoSaveEnabled && lastSaveTime) {
      return {
        icon: <Check className="h-4 w-4" />,
        text: t('autoSaveEnabled'),
        variant: 'default' as const
      };
    } else if (!autoSaveEnabled) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: t('autoSaveDisabled'),
        variant: 'destructive' as const
      };
    } else {
      return {
        icon: <Save className="h-4 w-4" />,
        text: t('notSaved'),
        variant: 'secondary' as const
      };
    }
  };
  
  const status = getStatusContent();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Status badge */}
      <Badge variant={status.variant} className="flex items-center gap-1">
        {status.icon}
        {status.text}
      </Badge>
      
      {/* Son saxlama vaxtı */}
      {lastSaveTime && (
        <span className="text-xs text-muted-foreground">
          {getLastSaveText()}
        </span>
      )}
      
      {/* Manual saxlama düyməsi */}
      {onManualSave && (
        <Button
          variant="outline"
          size="sm"
          onClick={onManualSave}
          disabled={isSaving}
          className="h-7 px-2"
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">{t('saveNow')}</span>
        </Button>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
