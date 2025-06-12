import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Info, Building2, Database, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useSectorCategories } from '@/hooks/categories/useCategoriesWithAssignment';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

/**
 * Sektor Məlumat Daxil Etmə Komponenti
 * 
 * Bu komponent sektoradmin-in birbaşa sektor adından məlumat daxil etməsi üçündür.
 * Məktəb seçimi yoxdur - yalnız sektor kateqoriyaları və sütunları.
 * 
 * Funksionallıq:
 * - Yalnız assignment="sectors" kateqoriyalar
 * - Sektor adından məlumat daxil etmə
 * - Auto-save və progress tracking
 * - Validation və error handling
 */
export const SectorDataEntryForm: React.FC = () => {
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  const queryClient = useQueryClient();
  
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get sector categories (assignment="sectors")
  const { data: categories, isLoading: categoriesLoading } = useSectorCategories();

  // Get current sector info
  const { data: sector, isLoading: sectorLoading } = useQuery({
    queryKey: ['current-sector', user?.sector_id],
    queryFn: async () => {
      if (!user?.sector_id) throw new Error('Sektor ID tapılmadı');
      
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name, region_id')
        .eq('id', user.sector_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.sector_id
  });

  // Get selected category with columns
  const { data: selectedCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-with-columns', selectedCategoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .eq('id', selectedCategoryId)
        .single();
      
      if (error) throw error;
      
      // Process and transform column data
      if (data?.columns) {
        data.columns = data.columns.map((column: any) => transformRawColumnData(column));
      }
      
      return data;
    },
    enabled: !!selectedCategoryId
  });

  // Get existing sector data for selected category
  const { data: existingData, isLoading: dataLoading } = useQuery({
    queryKey: ['sector-data-entries', user?.sector_id, selectedCategoryId],
    queryFn: async () => {
      if (!user?.sector_id || !selectedCategoryId) return [];
      
      const { data, error } = await supabase
        .from('sector_data_entries')
        .select('*')
        .eq('sector_id', user.sector_id)
        .eq('category_id', selectedCategoryId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.sector_id && !!selectedCategoryId
  });

  const columns = selectedCategory?.columns || [];

  // Initialize form data from existing data
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      const initialFormData = existingData.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value || '';
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(initialFormData);
      setHasUnsavedChanges(false);
    } else {
      // Reset form when category changes
      setFormData({});
      setHasUnsavedChanges(false);
    }
  }, [existingData, selectedCategoryId]);

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

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ isDraft = true }: { isDraft?: boolean }) => {
      if (!user?.sector_id || !selectedCategoryId) {
        throw new Error('Sektor və ya kateqoriya seçilməyib');
      }

      const entries = Object.entries(formData).map(([columnId, value]) => ({
        sector_id: user.sector_id,
        category_id: selectedCategoryId,
        column_id: columnId,
        value: value?.toString() || '',
        status: isDraft ? 'draft' : 'approved',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Delete existing entries first
      const { error: deleteError } = await supabase
        .from('sector_data_entries')
        .delete()
        .eq('sector_id', user.sector_id)
        .eq('category_id', selectedCategoryId);

      if (deleteError) throw deleteError;

      // Insert new entries
      const { data, error } = await supabase
        .from('sector_data_entries')
        .insert(entries)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['sector-data-entries', user?.sector_id, selectedCategoryId]
      });

      const message = variables.isDraft 
        ? `Draft saxlanıldı (${data.length} sahə)`
        : `Məlumatlar təsdiqləndi (${data.length} sahə)`;
        
      toast({
        title: 'Uğurlu',
        description: message
      });
    },
    onError: (error) => {
      toast({
        title: 'Xəta',
        description: error instanceof Error ? error.message : 'Saxlama xətası',
        variant: 'destructive'
      });
    }
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || !selectedCategoryId) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveMutation.mutate({ isDraft: true });
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges, selectedCategoryId]);

  // Handle manual save
  const handleSave = () => {
    saveMutation.mutate({ isDraft: true });
  };

  // Handle submit
  const handleSubmit = () => {
    // Check required fields
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

    saveMutation.mutate({ isDraft: false });
  };

  // Loading state
  if (categoriesLoading || sectorLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  // Error states
  if (!sector) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Sektor məlumatları tapılmadı</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sektor Məlumat Daxil Etmə
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <strong>{sector.name}</strong> sektoru adından məlumat daxil edin
          </p>
        </CardHeader>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium">Sektor Məlumat Rejimi</p>
          <p className="text-sm mt-1">
            Bu bölmədə sektorunuza aid xüsusi məlumatları daxil edirsiniz. 
            Bu məlumatlar məktəb məlumatlarından fərqlidir və yalnız sektor səviyyəsində istifadə olunur.
          </p>
        </AlertDescription>
      </Alert>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kateqoriya Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sektor kateqoriyası seçin:</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.columns?.length || 0} sahə
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categories?.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Sektor kateqoriyası tapılmadı</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Admin tərəfindən assignment="sectors" kateqoriyalar yaradılmalıdır
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Form */}
      {selectedCategoryId && (
        <>
          {/* Progress */}
          {selectedCategory && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tamamlanma</span>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div>
                    {hasUnsavedChanges ? (
                      <span>Dəyişikliklər saxlanılacaq...</span>
                    ) : lastSaved ? (
                      <span>Son saxlanma: {lastSaved.toLocaleTimeString()}</span>
                    ) : (
                      <span>Avtomatik saxlama aktiv</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{sector.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedCategory?.name}</span>
                <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                  {columns.filter(c => c.is_required).length} sahə
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {categoryLoading || dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Kateqoriya yüklənir...</span>
                </div>
              ) : columns.length === 0 ? (
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
                    
                    <div className="space-y-1">
                      {column.type === 'select' && column.options && column.options.length > 0 ? (
                        <select
                          value={formData[column.id] || ''}
                          onChange={(e) => handleFieldChange(column.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required={column.is_required}
                        >
                          <option value="">Seçin...</option>
                          {column.options.map((option: any, index: number) => (
                            <option key={option.id || index} value={option.value || option}>
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
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  💡 Məlumatlar arxa planda avtomatik saxlanılır
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Draft Saxla
                  </Button>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending || completionPercentage < 100}
                    size="lg"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Təsdiq et və Tamamla
                  </Button>
                </div>
              </div>
              
              {/* Validation Warning */}
              {completionPercentage < 100 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  ⚠️ Bütün məcburi sahələri doldurun və sonra təsdiqləyin
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SectorDataEntryForm;
