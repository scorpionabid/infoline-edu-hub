import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useSchoolCategories } from '@/hooks/categories/useCategoriesWithAssignment';
import { FileText, Calendar, Users, BookOpen, Loader2, AlertCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useDataEntryManager } from '@/hooks/dataEntry/useDataEntryManager';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import AutoSaveIndicator from './core/AutoSaveIndicator';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Məktəb Admini üçün Məlumat Daxiletmə Səhifəsi
 * 
 * Bu komponent:
 * ✅ Yalnız məktəb kateqoriyalarını göstərir (assignment="schools" || assignment="all")
 * ✅ Yalnız aktiv sütunları olan kateqoriyaları siyahıya alır
 * ✅ Kateqoriya seçimi və məlumat daxiletmə formu
 * ✅ Progress tracking və completion status
 * ✅ Auto-save funksionallığı
 */
const SchoolAdminDataEntry: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);
  const { toast } = useToast();

  // Fetch categories for the school
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useSchoolCategories();
  
  // Get selected category
  const selectedCategory = selectedCategoryId ? categories.find(cat => cat.id === selectedCategoryId) : null;
  
  // Get real category data with ONLY ACTIVE columns - this hook will only fetch when selectedCategoryId exists
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return null;
      
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
        .eq('id', selectedCategoryId)
        .eq('columns.status', 'active') // FILTER: Only active columns
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategoryId
  });
  
  // Debug current user state
  console.log('[SchoolAdminDataEntry] Current user state:', {
    userId: user?.id,
    schoolId: user?.school_id,
    userType: typeof user?.id,
    userIdValid: user?.id ? 'Present' : 'Missing'
  });

  // Data entry manager hooks - will only be active when needed
  const {
    formData,
    isLoading: dataLoading,
    isSubmitting,
    isSaving,
    isDataModified,
    entryStatus,
    error: dataError,
    lastSaved,
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    loadData
  } = useDataEntryManager({
    categoryId: selectedCategoryId || '',
    schoolId: user?.school_id || '',
    userId: user?.id || '', // This should be a valid UUID
    category: category || undefined,
    enableRealTime: !!selectedCategoryId,
    autoSave: false
  });
  
  // Get columns from category
  const columns = category?.columns || [];
  
  // Auto-save functionality
  const autoSave = useAutoSave({
    categoryId: selectedCategoryId || '',
    schoolId: user?.school_id || '',
    userId: user?.id || '', // Pass userId to auto-save
    formData,
    isDataModified,
    enabled: !!selectedCategoryId,
    onSaveSuccess: (savedAt) => {
      console.log('Auto-save successful at:', savedAt);
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  // Event handlers
  const handleManualSave = async () => {
    const result = await handleSave();
    if (result.success) {
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar saxlanıldı'
      });
    }
  };
  
  const handleFormSubmit = async () => {
    const result = await handleSubmit();
    if (result.success) {
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar təsdiq üçün göndərildi'
      });
    } else {
      toast({
        title: 'Xəta',
        description: result.error || 'Göndərmə zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  };
  
  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [columns, formData]);
  
  // Loading state
  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Məlumat Daxiletmə</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-70">
              <CardHeader className="animate-pulse bg-muted/30 h-[60px]" />
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (categoriesError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Məlumat Daxiletmə</h1>
        <div className="flex flex-col items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Xəta baş verdi</h3>
            <p className="text-muted-foreground">
              Kateqoriyalar yüklənərkən problem yaşandı. Yenidən cəhd edin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.school_id) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Məktəb təyin edilməyib</h3>
            <p className="text-muted-foreground">
              Məlumat daxil etmək üçün əvvəlcə məktəb təyin edilməlidir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Kateqoriyalar yüklənir...</span>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-600">Xəta baş verdi</h3>
            <p className="text-muted-foreground">
              Kateqoriyalar yüklənərkən problem yaşandı. Yenidən cəhd edin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Seçilmiş kateqoriya üçün data entry manager göstər
  if (selectedCategoryId) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedCategoryId(null)}
          >
            ← Geri qayıt
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedCategory?.name}</h1>
            <p className="text-muted-foreground">
              Məktəb: {user?.school_id} • Məlumat daxiletmə
            </p>
          </div>
        </div>

        {/* Data Entry Form */}
        {dataLoading || categoryLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Yüklənir...</span>
          </div>
        ) : dataError ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-red-600">Xəta: {dataError ? (typeof dataError === 'object' ? (dataError as any).message || 'Bilinməyən xəta' : String(dataError)) : 'Bilinməyən xəta'}</p>
          </div>
        ) : !category ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Kateqoriya tapılmadı</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Auto-save status */}
            <AutoSaveIndicator
              isSaving={autoSave.isSaving}
              autoSaveEnabled={autoSave.autoSaveEnabled}
              lastSaveTime={autoSave.lastSaveTime}
              saveError={autoSave.saveError}
              saveAttempts={autoSave.saveAttempts}
              hasUnsavedChanges={autoSave.hasUnsavedChanges}
              onManualSave={handleManualSave}
              onRetry={() => autoSave.saveNow()}
              onResetError={autoSave.resetError}
            />
            
            {/* Main form */}
            <Card>
              <CardHeader>
                <CardTitle>{category.name} Məlumat Daxiletməsi</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Tamamlanma: {completionPercentage}%
                  {lastSaved && ` • Son saxlanma: ${new Date(lastSaved).toLocaleString()}`}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {columns.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Bu kateqoriya üçün sahə tapılmadı</p>
                  </div>
                ) : (
                  columns.map((column) => (
                    <div key={column.id} className="space-y-2">
                      <label className="text-sm font-medium">
                        {column.name}
                        {column.is_required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                        value={formData[column.id] || ''}
                        onChange={(e) => handleFieldChange(column.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={column.placeholder || `${column.name} daxil edin`}
                        required={column.is_required}
                      />
                      {column.help_text && (
                        <p className="text-xs text-muted-foreground">{column.help_text}</p>
                      )}
                    </div>
                  ))
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleFormSubmit}
                    disabled={isSubmitting || autoSave.isSaving}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
                  </Button>
                  <Button
                    onClick={handleManualSave}
                    variant="outline"
                    disabled={isSaving || autoSave.isSaving}
                  >
                    {isSaving ? 'Saxlanılır...' : 'İndi saxla'}
                  </Button>
                  <Button
                    onClick={loadData}
                    variant="ghost"
                  >
                    Yenilə
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Kateqoriya seçimi
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Məlumat Daxiletmə</h1>
        <p className="text-muted-foreground mt-2">
          Məktəb məlumatlarınızı daxil edin və idarə edin
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Kateqoriya tapılmadı</h3>
              <p className="text-muted-foreground">
                Hazırda məktəb üçün heç bir aktiv kateqoriya yoxdur.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const columnCount = category.columns?.length || 0;
            const hasDeadline = category.deadline;
            const isOverdue = hasDeadline && new Date(category.deadline) < new Date();
            
            return (
              <Card 
                key={category.id} 
                className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                    {category.status && (
                      <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                        {category.status === 'active' ? 'Aktiv' : category.status}
                      </Badge>
                    )}
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Column count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{columnCount} sahə</span>
                    </div>
                    
                    {/* Deadline */}
                    {hasDeadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className={isOverdue ? 'text-red-600' : 'text-muted-foreground'}>
                          Son tarix: {format(new Date(category.deadline), 'dd.MM.yyyy')}
                        </span>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Gecikib
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Progress - Bu hələlik placeholder-dir, sonradan real data əlavə ediləcək */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tamamlanma</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchoolAdminDataEntry;
