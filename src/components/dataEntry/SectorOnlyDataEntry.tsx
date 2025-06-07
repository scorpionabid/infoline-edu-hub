
import React, { useState } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSectorDataEntry } from '@/hooks/dataEntry/sector/useSectorDataEntry';
import EnhancedDataEntryForm from '@/components/dataEntry/enhanced/EnhancedDataEntryForm';
import { Folder, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export const SectorOnlyDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Yalnız sektor kateqoriyalarını əldə edirik
  const { categories, isLoading: categoriesLoading } = useCategoriesQuery({
    assignment: 'sectors' // Yalnız sektor üçün olan kateqoriyalar
  });

  // Sektor məlumat daxil etmə hook-u
  const {
    columns,
    formData,
    isLoading: dataLoading,
    isSaving,
    isSubmitting,
    completionPercentage,
    errors,
    isValid,
    updateEntry,
    saveEntries,
    submitEntries,
    resetForm
  } = useSectorDataEntry({
    sectorId: user?.sector_id || '',
    categoryId: selectedCategoryId || '',
    onSave: (entries) => {
      console.log('Sector data saved:', entries);
      toast.success('Sektor məlumatları yadda saxlanıldı');
    },
    onSubmit: (entries) => {
      console.log('Sector data submitted:', entries);
      toast.success('Sektor məlumatları təsdiq üçün göndərildi');
    }
  });

  // Sektor kateqoriyalarını filtrləyirik
  const sectorCategories = categories.filter(cat => 
    cat.assignment === 'sectors' || cat.assignment === 'all'
  );

  if (categoriesLoading) {
    return <LoadingSpinner />;
  }

  if (!user?.sector_id) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Sektor məlumatınız tapılmadı</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async (data: Record<string, any>) => {
    await saveEntries();
  };

  const handleSubmit = async (data: Record<string, any>) => {
    await submitEntries();
  };

  return (
    <div className="space-y-6">
      {/* Kateqoriya Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Sektor Kateqoriyaları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategoryId || ''} onValueChange={setSelectedCategoryId}>
            <TabsList className="grid w-full grid-cols-auto gap-2">
              {sectorCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      Sektor
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {sectorCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {category.name}
                      <Badge className="bg-blue-100 text-blue-800">
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
                        schoolId={user.sector_id || ''} // sectorId-ni schoolId kimi istifadə edirik
                        columns={columns}
                        initialData={formData}
                        onSave={handleSave}
                        onSubmit={handleSubmit}
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

          {sectorCategories.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Sektor üçün kateqoriya tapılmadı
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorOnlyDataEntry;
