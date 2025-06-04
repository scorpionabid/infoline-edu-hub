
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataEntry } from '@/hooks/business/dataEntry/useDataEntry';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import DataEntryForm from './core/DataEntryForm';
import { FieldRenderer } from './fields/FieldRenderer';
import { AlertCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Load categories
  const { categories, loading: categoriesLoading } = useCategoriesQuery();
  
  // Load data entry for selected category
  const {
    category,
    columns,
    entries,
    isLoading: dataLoading,
    isSubmitting,
    completionPercentage,
    hasAllRequiredData,
    updateEntryValue,
    saveAll,
    submitAll
  } = useDataEntry({
    categoryId: selectedCategoryId,
    schoolId,
    onComplete
  });

  const loading = categoriesLoading || dataLoading;
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Kateqoriya Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategoryId} onValueChange={setSelectedCategoryId} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-auto">
                    {category.column_count || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Entry Form */}
      {selectedCategoryId && (
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {selectedCategory?.name} - Məlumat Daxil Etmə
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={hasAllRequiredData ? "default" : "secondary"}>
                  {completionPercentage}% tamamlandı
                </Badge>
                <Badge variant="outline">
                  {columns?.length || 0} sahə
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Məlumatlar yüklənir...</span>
              </div>
            ) : columns && columns.length > 0 ? (
              <form onSubmit={(e) => { e.preventDefault(); submitAll(); }} className="space-y-4">
                {columns.map((column) => (
                  <div key={column.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {column.name}
                      {column.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <FieldRenderer
                      column={column}
                      value={entries.find(e => e.column_id === column.id)?.value || ''}
                      onChange={(e) => updateEntryValue(column.id, e.target.value)}
                      onValueChange={(value) => updateEntryValue(column.id, value)}
                    />
                    {column.help_text && (
                      <p className="text-xs text-muted-foreground">{column.help_text}</p>
                    )}
                  </div>
                ))}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveAll}
                      disabled={isSubmitting}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Yadda Saxla
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onClose && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                      >
                        Bağla
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting || !hasAllRequiredData}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Göndərilir...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Təsdiq üçün Göndər
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bu kateqoriya üçün sahə tapılmadı</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolDataEntryManager;
