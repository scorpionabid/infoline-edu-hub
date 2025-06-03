import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, CheckCircle2, AlertCircle, FileText, Save } from 'lucide-react';
import { useSectorCategories } from '@/hooks/dataEntry/useSectorCategories';
import { useDataEntry } from '@/hooks/dataEntry/useDataEntry';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { FieldRenderer } from './fields';

interface SectorDataEntryProps {
  onComplete?: () => void;
}

export const SectorDataEntry: React.FC<SectorDataEntryProps> = ({
  onComplete
}) => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Yalnız sector kategoriyalarını əldə et
  const { categories, loading: categoriesLoading, error: categoriesError } = useSectorCategories();
  
  // Data entry hook
  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    selectedCategory,
    handleCategoryChange
  } = useDataEntry({
    schoolId: user?.sector_id || null,
    categoryId: selectedCategoryId,
    onComplete
  });

  // Category seçimi
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategoryId(categoryId);
      handleCategoryChange(category);
    }
  };

  // Stats hesablaması
  const stats = React.useMemo(() => {
    const totalCategories = categories.length;
    const totalColumns = categories.reduce((sum, cat) => sum + (cat.columns?.length || 0), 0);
    
    return {
      totalCategories,
      totalColumns,
      filledColumns: 0, // Bu daha sonra hesablanacaq
      completionRate: 0 // Bu daha sonra hesablanacaq
    };
  }, [categories]);

  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Kategoriyalar yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Xəta baş verdi</h3>
              <p className="text-gray-600">{categoriesError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Sektor Məlumatları</h2>
          <p className="text-muted-foreground">Sektorunuza aid məlumatları idarə edin.</p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sektor kateqoriyası tapılmadı</h3>
              <p className="text-gray-600">
                Hazırda sizin sektorunuz üçün aktiv kateqoriya mövcud deyil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sektor Məlumatları</h2>
        <p className="text-muted-foreground">
          Sektorunuza aid məlumatları daxil edin. Bu məlumatlar avtomatik təsdiqlənəcək.
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              Avtomatik Təsdiq Aktivdir
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Sektor administratoru olaraq daxil etdiyiniz məlumatlar avtomatik təsdiqlənəcək.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi kateqoriyalar</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi sahələr</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalColumns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seçilmiş kateqoriya</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-green-600">
              {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'Seçilməyib'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Kateqoriya Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              
              return (
                <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                      {category.columns?.length || 0} sahə
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                  )}
                  
                  {category.deadline && (
                    <p className="text-xs text-red-600">
                      Son tarix: {new Date(category.deadline).toLocaleDateString('az')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Data Entry Form */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedCategory.name} - Məlumat Daxil Etmə
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedCategory.columns?.map((column) => (
                <div key={column.id} className="space-y-2">
                  <FieldRenderer
                    column={column}
                    value={formData[column.id] || ''}
                    onValueChange={(value) => handleChange(column.id, value)}
                  />
                </div>
              ))}
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Saxlanılır...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Saxla və Təsdiqlə
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SectorDataEntry;
