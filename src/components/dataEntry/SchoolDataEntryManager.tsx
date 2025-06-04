import React, { useState, useEffect } from 'react';
import { useDataEntry } from '@/hooks/dataEntry/useDataEntry';
import { DataEntryFormManager } from './core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { CategoryWithColumns } from '@/types/category';
import { 
  Folder, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BookOpen,
  School
} from 'lucide-react';

interface SchoolDataEntryManagerProps {
  schoolId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export const SchoolDataEntryManager: React.FC<SchoolDataEntryManagerProps> = ({
  schoolId,
  onComplete,
  onClose
}) => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // useDataEntry hook-unu istifade edirik
  const {
    formData,
    categories,
    selectedCategory,
    currentCategory,
    loading,
    loadingEntry,
    isSubmitting,
    isAutoSaving,
    handleChange,
    handleSubmit,
    handleSave,
    handleCategoryChange,
    isDataModified,
    error
  } = useDataEntry({
    schoolId,
    categoryId: selectedCategoryId,
    onComplete
  });

  // Ilk kategoriyanı avtomatik sec
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      const firstCategory = categories[0];
      setSelectedCategoryId(firstCategory.id);
      handleCategoryChange(firstCategory);
    }
  }, [categories, selectedCategoryId, handleCategoryChange]);

  // Kateqoriya secimi
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategoryId(categoryId);
      handleCategoryChange(category);
    }
  };

  // Calculate completion for each category
  const getCategoryCompletion = (category: CategoryWithColumns) => {
    if (!category.columns || category.columns.length === 0) return 0;
    
    const requiredFields = category.columns.filter(col => col.is_required);
    const totalFields = Math.max(requiredFields.length, category.columns.length);
    
    const completedFields = category.columns.filter(col => {
      const value = formData[col.id];
      if (col.is_required) {
        return value !== undefined && value !== null && value !== '';
      }
      return value !== undefined && value !== null && value !== '';
    }).length;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  // Wrapper functions for DataEntryFormManager
  const handleFormDataChange = (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      handleChange(key, value);
    });
  };

  const handleFormSave = async () => {
    await handleSave();
  };

  const handleFormSubmit = async () => {
    await new Promise<void>((resolve, reject) => {
      handleSubmit({
        preventDefault: () => {},
        target: {}
      } as React.FormEvent)
        .then(() => {
          resolve();
          if (onComplete) onComplete();
        })
        .catch(reject);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <School className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Kateqoriyalar yuklenir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Xeta bas verdi</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Kateqoriya tapilmadi</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Bu mekteb ucun melumat daxil etmek ucun hec bir kateqoriya movcud deyil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Categories Overview */}
      <Card className="flex-shrink-0 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Melumat Kateqoriyalari
            <Badge variant="secondary">{categories.length} kateqoriya</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategoryId} onValueChange={handleCategorySelect}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
              {categories.map((category) => {
                const completion = getCategoryCompletion(category);
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <div className="flex items-center gap-1">
                      <Folder className="h-4 w-4" />
                      <span className="truncate max-w-24">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {completion === 100 ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-600" /> 
                          Tamamlandi
                        </>
                      ) : completion > 0 ? (
                        <>
                          <Clock className="h-3 w-3 text-yellow-600" /> 
                          {completion}%
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-gray-400" /> 
                          Baslanmayib
                        </>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Category Form */}
      <div className="flex-1 overflow-hidden">
        {currentCategory && (
          <DataEntryFormManager
            category={currentCategory}
            schoolId={schoolId}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onSave={handleFormSave}
            onSubmit={handleFormSubmit}
            onExportTemplate={() => {
              // Excel template download logic
              console.log('Downloading template for category:', currentCategory.name);
            }}
            onImportData={async (file: File) => {
              // Excel import logic
              console.log('Importing Excel file:', file.name);
            }}
            isLoading={loadingEntry}
            isSaving={isAutoSaving}
            isSubmitting={isSubmitting}
            readOnly={false}
            // Auto-approval for sector admin
            entryStatus={user?.role === 'sectoradmin' ? 'approved' : 'pending'}
          />
        )}
      </div>
    </div>
  );
};

export default SchoolDataEntryManager;
