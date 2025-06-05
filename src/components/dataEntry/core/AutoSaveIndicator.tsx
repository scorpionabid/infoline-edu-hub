
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, CheckCircle2 } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: Date | null;
  onManualSave: () => void;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  autoSaveEnabled,
  lastSaveTime,
  onManualSave
}) => {
  const formatLastSaveTime = (time: Date | null) => {
    if (!time) return 'Never';
    return time.toLocaleTimeString();
  };

  const getStatusBadge = () => {
    if (isSaving) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3 animate-spin" />
          Saving...
        </Badge>
      );
    }

    if (lastSaveTime) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          Saved {formatLastSaveTime(lastSaveTime)}
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        Not saved
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {getStatusBadge()}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onManualSave}
        disabled={isSaving}
        className="flex items-center gap-1"
      >
        <Save className="h-3 w-3" />
        Save Now
      </Button>
      
      {autoSaveEnabled && (
        <span className="text-xs text-muted-foreground">
          Auto-save enabled
        </span>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
