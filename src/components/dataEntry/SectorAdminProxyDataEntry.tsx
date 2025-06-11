import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, Save, Info, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { ProxyDataEntryService } from '@/services/dataEntry/proxyDataEntryService';
import AutoSaveIndicator from './core/AutoSaveIndicator';

interface SectorAdminProxyDataEntryProps {
  schoolId: string;
  categoryId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

/**
 * SectorAdmin Proxy Data Entry Manager
 * 
 * SectorAdmin-in məktəb məlumatlarını proxy olaraq daxil etməsi üçün
 * xüsusi komponent. Əsas fərqlər:
 * 
 * - Proxy məlumat daxil etmə
 * - Avtomatik təsdiq (SectorAdmin icazəsi varsa)
 * - Proxy bildirişləri
 * - Audit trail
 * - Məktəb və proxy məlumatlarının göstərilməsi
 */
export const SectorAdminProxyDataEntry: React.FC<SectorAdminProxyDataEntryProps> = ({
  schoolId,
  categoryId,
  onClose,
  onComplete
}) => {
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  // State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDataModified, setIsDataModified] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  // Fetch school data
  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, principal_name, sector_id, region_id')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });

  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*, columns(*)')
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });

  // Fetch existing data
  const { data: existingData, isLoading: dataLoading } = useQuery({
    queryKey: ['proxyDataEntry', schoolId, categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId && !!categoryId
  });

  // Check proxy data status
  const { data: proxyStatus } = useQuery({
    queryKey: ['proxyStatus', schoolId, categoryId],
    queryFn: async () => {
      return await ProxyDataEntryService.getProxyDataStatus(schoolId, categoryId);
    },
    enabled: !!schoolId && !!categoryId
  });

  // Columns from category
  const columns = category?.columns || [];

  // Initialize form data
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      const initialFormData = existingData.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value || '';
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(initialFormData);
      setIsDataModified(false);
    }
  }, [existingData]);

  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setIsDataModified(true);
    setAutoSaveError(null);
  };

  // Handle manual save
  const handleManualSave = async () => {
    if (!user?.id || !user?.role) {
      toast({
        title: 'Xəta',
        description: 'İstifadəçi məlumatları tapılmadı',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    setAutoSaveError(null);

    try {
      const result = await ProxyDataEntryService.saveProxyFormData(formData, {
        categoryId,
        schoolId,
        userId: user.id,
        proxyUserId: user.id,
        proxyUserRole: user.role,
        originalSchoolId: schoolId,
        proxyReason: 'SectorAdmin proxy data entry - manual save',
        status: 'draft'
      });

      if (result.success) {
        setLastSaved(new Date());
        setIsDataModified(false);
        toast({
          title: 'Uğurlu',
          description: `Proxy məlumatlar saxlanıldı (${result.savedCount} sahə)`
        });
      } else {
        throw new Error(result.error || 'Saxlama xətası');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Saxlama xətası';
      setAutoSaveError(errorMessage);
      toast({
        title: 'Saxlama xətası',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle submit with auto approval
  const handleSubmit = async () => {
    if (!user?.id || !user?.role) {
      toast({
        title: 'Xəta',
        description: 'İstifadəçi məlumatları tapılmadı',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First save the data
      const saveResult = await ProxyDataEntryService.saveProxyFormData(formData, {
        categoryId,
        schoolId,
        userId: user.id,
        proxyUserId: user.id,
        proxyUserRole: user.role,
        originalSchoolId: schoolId,
        proxyReason: 'SectorAdmin proxy data entry - submission',
        status: 'draft'
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Saxlama xətası');
      }

      // Then submit for approval (with auto-approval)
      const submitResult = await ProxyDataEntryService.submitProxyData({
        categoryId,
        schoolId,
        proxyUserId: user.id,
        proxyUserRole: user.role,
        proxyReason: 'SectorAdmin proxy data entry - submission',
        autoApprove: true
      });

      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Göndərmə xətası');
      }

      // Success feedback
      const message = submitResult.autoApproved 
        ? `Proxy məlumatlar avtomatik təsdiqləndi (${submitResult.savedCount} sahə)`
        : `Proxy məlumatlar təsdiq üçün göndərildi (${submitResult.savedCount} sahə)`;

      toast({
        title: 'Uğurlu',
        description: message
      });

      // Call completion callback
      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Göndərmə xətası';
      toast({
        title: 'Göndərmə xətası',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [columns, formData]);

  // Loading state
  if (schoolLoading || categoryLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  // Error states
  if (!school) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Məktəb tapılmadı</p>
        </CardContent>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Kateqoriya tapılmadı</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Proxy Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Proxy Məlumat Daxil Etmə Rejimi</p>
            <p className="text-sm">
              Siz <strong>{school.name}</strong> məktəbi üçün proxy olaraq məlumat daxil edirsiniz.
              Bu məlumatlar avtomatik olaraq təsdiqlənəcək və məktəb adminə bildiriş göndəriləcək.
            </p>
            {proxyStatus?.success && proxyStatus.isProxyData && (
              <p className="text-xs text-muted-foreground">
                Bu məktəb üçün əvvəllər proxy məlumat daxil edilib. Status: <Badge variant="outline">{proxyStatus.status}</Badge>
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Auto-save indicator */}
      <AutoSaveIndicator
        isSaving={isSaving}
        autoSaveEnabled={false} // Manual save only
        lastSaveTime={lastSaved}
        saveError={autoSaveError}
        saveAttempts={0}
        hasUnsavedChanges={isDataModified}
        onManualSave={handleManualSave}
        onRetry={handleManualSave}
        onResetError={() => setAutoSaveError(null)}
      />

      {/* School and Category Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5" />
              Məktəb Məlumatları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Ad: </span>
              <span className="text-sm">{school.name}</span>
            </div>
            {school.principal_name && (
              <div>
                <span className="text-sm font-medium">Direktor: </span>
                <span className="text-sm">{school.principal_name}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium">ID: </span>
              <span className="text-sm font-mono">{school.id}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Proxy Məlumatları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Proxy İstifadəçi: </span>
              <span className="text-sm">{user?.full_name || 'Naməlum'}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Rol: </span>
              <Badge variant="outline">{user?.role}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Tamamlanma: </span>
              <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                {completionPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{category.name} - Məlumat Daxil Etmə</span>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Son saxlanma: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                {completionPercentage}% tamamlandı
              </Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Proxy rejimində məlumat daxil edirsiniz. Məlumatlar avtomatik təsdiq olunacaq.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {columns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bu kateqoriya üçün sahə tapılmadı</p>
            </div>
          ) : (
            columns.map((column) => (
              <div key={column.id} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  {column.name}
                  {column.is_required && <span className="text-red-500">*</span>}
                </label>
                
                {/* Input field based on column type */}
                {column.type === 'select' && column.options ? (
                  <select
                    value={formData[column.id] || ''}
                    onChange={(e) => handleFieldChange(column.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required={column.is_required}
                  >
                    <option value="">Seçin...</option>
                    {(column.options as any[])?.map((option: any, index: number) => (
                      <option key={index} value={option.value || option}>
                        {option.label || option}
                      </option>
                    ))}
                  </select>
                ) : column.type === 'textarea' ? (
                  <textarea
                    value={formData[column.id] || ''}
                    onChange={(e) => handleFieldChange(column.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder={column.placeholder || `${column.name} daxil edin`}
                    required={column.is_required}
                  />
                ) : (
                  <input
                    type={
                      column.type === 'number' ? 'number' :
                      column.type === 'date' ? 'date' :
                      column.type === 'email' ? 'email' :
                      'text'
                    }
                    value={formData[column.id] || ''}
                    onChange={(e) => handleFieldChange(column.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={column.placeholder || `${column.name} daxil edin`}
                    required={column.is_required}
                  />
                )}
                
                {column.help_text && (
                  <p className="text-xs text-muted-foreground">{column.help_text}</p>
                )}
              </div>
            ))
          )}
          
          <Separator />
          
          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Göndərilir...' : 'Təsdiq et və Saxla'}
            </Button>
            
            <Button
              onClick={handleManualSave}
              variant="outline"
              disabled={isSaving || isSubmitting}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saxlanılır...' : 'Məsləhən saxla'}
            </Button>
            
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                disabled={isSubmitting || isSaving}
              >
                Bağla
              </Button>
            )}
          </div>
          
          {/* Help text */}
          <div className="text-xs text-muted-foreground pt-2">
            <p>
              💡 <strong>Proxy rejim:</strong> Bu məlumatlar sizin adınızdan daxil edilir və avtomatik təsdiq olunur.
              Məktəb adminə bildiriş göndəriləcək.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorAdminProxyDataEntry;