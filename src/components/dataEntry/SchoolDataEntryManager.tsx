
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Folder } from 'lucide-react';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { useDataEntry } from '@/hooks/business/dataEntry/useDataEntry';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import EnhancedDataEntryForm from './enhanced/EnhancedDataEntryForm';

interface SchoolDataEntryManagerProps {
  schoolId: string;
  onClose: () => void;
  onComplete: () => void;
}

export const SchoolDataEntryManager: React.FC<SchoolDataEntryManagerProps> = ({
  schoolId,
  onClose,
  onComplete
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Get school categories only
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategoriesQuery({
    assignment: 'schools'
  });

  // Get data entry for selected category
  const {
    category,
    columns,
    entries,
    getValueForColumn,
    updateEntryValue,
    isLoading: dataLoading,
    completionPercentage,
    saveAll,
    submitAll
  } = useDataEntry({
    categoryId: selectedCategoryId || '',
    schoolId,
    onComplete
  });

  // Convert entries to form data format
  const initialFormData = useMemo(() => {
    if (!columns.length) return {};
    
    const formData: Record<string, any> = {};
    columns.forEach(column => {
      formData[column.id] = getValueForColumn(column);
    });
    return formData;
  }, [columns, getValueForColumn]);

  if (categoriesLoading) {
    return <LoadingSpinner />;
  }

  if (categoriesError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Xəta baş verdi: {categoriesError.message}</p>
        </CardContent>
      </Card>
    );
  }

  const schoolCategories = categories.filter(cat => 
    cat.assignment === 'schools' || cat.assignment === 'all'
  );

  const handleSave = async (data: Record<string, any>) => {
    await saveAll();
  };

  const handleSubmit = async (data: Record<string, any>) => {
    await submitAll();
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Məktəb Məlumat Daxil Etmə
            </CardTitle>
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Categories and Data Entry */}
      <div className="flex-1 overflow-hidden">
        {schoolCategories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Məktəb üçün kateqoriya tapılmadı
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedCategoryId || ''} onValueChange={setSelectedCategoryId}>
            <TabsList className="grid w-full grid-cols-auto gap-2">
              {schoolCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(category as any).column_count || 0} sütun
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {schoolCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {category.name}
                      <Badge className="bg-green-100 text-green-800">
                        {completionPercentage}% tamamlandı
                      </Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <LoadingSpinner />
                    ) : columns.length > 0 ? (
                      <EnhancedDataEntryForm
                        categoryId={category.id}
                        schoolId={schoolId}
                        columns={columns}
                        initialData={initialFormData}
                        onSave={handleSave}
                        onSubmit={handleSubmit}
                        onFieldChange={updateEntryValue}
                        readOnly={false}
                      />
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                          Bu kateqoriya üçün hələ sütun təyin edilməyib
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SchoolDataEntryManager;
