import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Database, 
  Loader2, 
  AlertCircle,
  // CheckCircle
} from 'lucide-react';
import { Category, Column } from '@/hooks/dataManagement/useDataManagement';
import { toast } from 'sonner';

interface SectorDataEntryProps {
  category: Category;
  column: Column;
  onDataSave: (entityId: string, value: string) => Promise<boolean>;
  onBack: () => void;
  loading?: boolean;
  permissions: {
    sectorId?: string;
    canEdit: boolean;
    role: string;
  };
}

/**
 * Sector Data Entry Component
 * 
 * Provides a simple input interface for sector-specific data entry.
 * Used when category.assignment === 'sectors'.
 * 
 * Features:
 * - Column type-specific input rendering
 * - Required field validation
 * - Auto-save integration
 * - Help text display
 * - Loading states
 * - Error handling
 */
export const SectorDataEntry: React.FC<SectorDataEntryProps> = ({
  category,
  column,
  onDataSave,
  onBack,
  loading = false,
  // permissions
}) => {
  const [sectorValue, setSectorValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save functionality with debounce
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback(async (value: string) => {
    if (!permissions.sectorId || !value.trim()) return;

    setSaveStatus('saving');
    try {
      const success = await onDataSave(permissions.sectorId, value);
      if (success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        // Reset to idle after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save error:', error);
    }
  }, [permissions.sectorId, onDataSave]);

  // Handle value change with auto-save debounce
  const handleValueChange = useCallback((value: string) => {
    setSectorValue(value);
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save (3 seconds after user stops typing)
    const timeout = setTimeout(() => {
      handleAutoSave(value);
    }, 3000);
    
    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, handleAutoSave]);

  // Manual save handler
  const handleManualSave = useCallback(async () => {
    if (!permissions.sectorId) {
      toast.error('Sektor ID tapılmadı');
      return;
    }

    if (column.is_required && !sectorValue.trim()) {
      toast.error('Bu sahə məcburidir');
      return;
    }

    setIsSubmitting(true);
    setSaveStatus('saving');
    
    try {
      const success = await onDataSave(permissions.sectorId, sectorValue);
      if (success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        toast.success('Sektor məlumatı uğurla saxlanıldı');
        
        // Clear value after successful save
        setSectorValue('');
        
        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        toast.error('Məlumat saxlanarkən xəta baş verdi');
      }
    } catch (error) {
      setSaveStatus('error');
      toast.error('Məlumat saxlanarkən xəta baş verdi');
      console.error('Manual save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [sectorValue, permissions.sectorId, onDataSave, column.is_required]);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Render input field based on column type
  const renderInputField = () => {
    const commonProps = {
      disabled: isSubmitting || loading || !permissions.canEdit,
      className: "w-full"
    };

    if (column.type === 'textarea') {
      return (
        <Textarea
          placeholder={column.placeholder || 'Məlumatı daxil edin...'}
          value={sectorValue}
          onChange={(e) => handleValueChange(e.target.value)}
          rows={4}
          {...commonProps}
        />
      );
    } else if (column.type === 'select' && column.options && column.options.length > 0) {
      return (
        <Select 
          value={sectorValue} 
          onValueChange={handleValueChange} 
          disabled={commonProps.disabled}
        >
          <SelectTrigger className={commonProps.className}>
            <SelectValue placeholder="Seçim edin..." />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option: any, index: number) => {
              const value = option.value || option;
              const label = option.label || option.value || option;
              return (
                <SelectItem key={`${value}-${index}`} value={String(value)}>
                  {String(label)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          type={column.type === 'number' ? 'number' : 'text'}
          placeholder={column.placeholder || 'Məlumatı daxil edin...'}
          value={sectorValue}
          onChange={(e) => handleValueChange(e.target.value)}
          {...commonProps}
        />
      );
    }
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving': {
        return (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saxlanır...
          </div>
        );
      }
      case 'saved': {
        return (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Saxlanıldı {lastSaved && `(${lastSaved.toLocaleTimeString('az-AZ')})`}
          </div>
        );
      }
      case 'error': {
        return (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Saxlama xətası
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Check if user has permission to edit
  if (!permissions.canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            // Geri
          </Button>
          <div>
            <h3 className="text-2xl font-bold">Sektor Məlumatı</h3>
            <p className="text-muted-foreground">Giriş icazəniz yoxdur</p>
          </div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sektor üçün məlumat daxil etmək icazəniz yoxdur. 
            Zəhmət olmasa administrator ilə əlaqə saxlayın.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          // Geri
        </Button>
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Sektor Məlumatı
          </h3>
          <p className="text-muted-foreground">
            {column.name} sütunu üçün sektor məlumatı daxil edin
          </p>
        </div>
      </div>

      {/* Category and Column Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kateqoriya:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{category.name}</span>
                <Badge variant="default">Sektor Məlumatı</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sütun:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{column.name}</span>
                <Badge variant="outline">{column.type}</Badge>
                {column.is_required && (
                  <Badge variant="destructive" className="text-xs">
                    Məcburi
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sektor Məlumatı Daxil Edin</CardTitle>
            {renderSaveStatus()}
          </div>
          {category.description && (
            <div className="text-sm text-muted-foreground">
              {category.description}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Help text */}
          {column.help_text && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {column.help_text}
              </AlertDescription>
            </Alert>
          )}

          {/* Input field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {column.name} {column.is_required && <span className="text-red-500">*</span>}
              </span>
              {sectorValue.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {sectorValue.length} karakter
                </span>
              )}
            </div>
            {renderInputField()}
          </div>

          {/* Auto-save notice */}
          <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
            💡 Məlumatlar yazdıqdan 3 saniyə sonra avtomatik saxlanılır
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onBack} 
              disabled={isSubmitting}
            >
              Ləğv et
            </Button>
            <Button 
              onClick={handleManualSave}
              disabled={
                isSubmitting || 
                loading ||
                (column.is_required && !sectorValue.trim()) ||
                saveStatus === 'saving'
              }
              className="min-w-[120px]"
            >
              {isSubmitting || saveStatus === 'saving' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saxlanır...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  // Saxla
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
          <Database className="h-4 w-4" />
          <span>
            Bu məlumat sektor səviyyəsində qeyd edilir və avtomatik təsdiq olunur
          </span>
        </div>
      </div>
    </div>
  );
};
