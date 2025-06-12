import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send, Info, User, Building, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { ProxyDataEntryService } from '@/services/dataEntry/proxyDataEntryService';

interface SectorAdminProxyDataEntryProps {
  schoolId: string;
  categoryId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

/**
 * Sadələşdirilmiş SectorAdmin Proxy Data Entry
 * 
 * Təkmilləşdirmələr:
 * - Tək "Təsdiq et və Saxla" düyməsi  
 * - Arxa planda avtomatik draft saxlama
 * - Sadə və aydın interfeys
 * - Progress tracking
 * - Mobile-friendly dizayn
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
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch school data
  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, principal_name')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });

  // Fetch category data with ONLY ACTIVE columns
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('id', categoryId)
        .eq('columns.status', 'active') // FILTER: Only active columns
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

  const columns = category?.columns || [];

  // Initialize form data
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      const initialFormData = existingData.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value || '';
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(initialFormData);
      setHasUnsavedChanges(false);
    }
  }, [existingData]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || !user?.id) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        await ProxyDataEntryService.saveProxyFormData(formData, {
          categoryId,
          schoolId,
          userId: user.id,
          proxyUserId: user.id,
          proxyUserRole: user.role,
          originalSchoolId: schoolId,
          proxyReason: 'Auto-save draft',
          status: 'draft'
        });
        
        setLastAutoSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges, user?.id, categoryId, schoolId]);

  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setHasUnsavedChanges(true);
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

  // Handle submit with confirmation
  const handleSubmit = async () => {
    if (!user?.id || !user?.role) {
      toast({
        title: 'Xəta',
        description: 'İstifadəçi məlumatları tapılmadı',
        variant: 'destructive'
      });
      return;
    }

    // Check if required fields are filled
    const requiredColumns = columns.filter(col => col.is_required);
    const missingFields = requiredColumns.filter(col => {
      const value = formData[col.id];
      return !value || value === '';
    });

    if (missingFields.length > 0) {
      toast({
        title: 'Tamamlanmayan sahələr',
        description: `Zəhmət olmasa bu sahələri doldurun: ${missingFields.map(f => f.name).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save and submit in one operation
      const saveResult = await ProxyDataEntryService.saveProxyFormData(formData, {
        categoryId,
        schoolId,
        userId: user.id,
        proxyUserId: user.id,
        proxyUserRole: user.role,
        originalSchoolId: schoolId,
        proxyReason: 'SectorAdmin proxy data entry - final submission',
        status: 'draft'
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Saxlama xətası');
      }

      // Submit for auto-approval
      const submitResult = await ProxyDataEntryService.submitProxyData({
        categoryId,
        schoolId,
        proxyUserId: user.id,
        proxyUserRole: user.role,
        proxyReason: 'SectorAdmin proxy data entry - final submission',
        autoApprove: true
      });

      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Təsdiq xətası');
      }

      // Success
      toast({
        title: '✅ Uğurlu',
        description: `Proxy məlumatlar avtomatik təsdiqləndi (${submitResult.savedCount} sahə)`,
      });

      // Call completion callback
      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Göndərmə xətası';
      toast({
        title: 'Xəta',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
  if (!school || !category) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">
            {!school ? 'Məktəb tapılmadı' : 'Kateqoriya tapılmadı'}
          </p>
          {onClose && (
            <Button onClick={onClose} variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        {onClose && (
          <Button onClick={onClose} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Proxy Məlumat Daxil Etmə</h1>
          <p className="text-sm text-muted-foreground">
            {school.name} məktəbi üçün {category.name} kateqoriyası
          </p>
        </div>
      </div>

      {/* Proxy Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              Siz <strong>{school.name}</strong> məktəbi adından məlumat daxil edirsiniz
            </p>
            <p className="text-sm">
              Bu məlumatlar avtomatik təsdiq olunacaq və məktəb adminə bildiriş göndəriləcək.
              Məlumatlar arxa planda avtomatik saxlanılır.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Progress and Status */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tamamlanma</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          {/* Auto-save status */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {hasUnsavedChanges ? (
                <span>Dəyişikliklər saxlanılacaq...</span>
              ) : lastAutoSaved ? (
                <span>Son saxlanma: {lastAutoSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Avtomatik saxlama aktiv</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{user?.full_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                <span>{school.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{category.name}</span>
            <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
              {columns.filter(c => c.is_required).length} sahə
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {columns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bu kateqoriya üçün sahə tapılmadı</p>
            </div>
          ) : (
            columns.map((column) => (
              <div key={column.id} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {column.name}
                  {column.is_required && <span className="text-red-500">*</span>}
                </label>
                
                {/* Input field based on column type */}
                <div className="space-y-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
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
              </div>
            ))
          )}
          
          <Separator />
          
          {/* Single Action Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              💡 Məlumatlar arxa planda avtomatik saxlanılır
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || completionPercentage < 100}
              size="lg"
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Təsdiq edilir...' : 'Təsdiq et və Tamamla'}
            </Button>
          </div>
          
          {/* Help text */}
          {completionPercentage < 100 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              ⚠️ Bütün məcburi sahələri doldurun və sonra təsdiqləyin
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorAdminProxyDataEntry;
