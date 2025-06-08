
import React, { useState } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SectorDataEntryForm from './sector/SectorDataEntryForm';

export const SectorOnlyDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Load sector categories only
  const { categories, isLoading: categoriesLoading } = useCategoriesQuery({
    assignment: 'sectors'
  });

  // Filter sector categories
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

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Sektor Kateqoriyaları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sectorCategories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Sektor üçün kateqoriya tapılmadı
              </p>
            </div>
          ) : (
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
                      </CardTitle>
                      <p className="text-muted-foreground">{category.description}</p>
                    </CardHeader>
                    <CardContent>
                      <SectorDataEntryForm
                        categoryId={category.id}
                        sectorId={user.sector_id || ''}
                        onComplete={() => {
                          console.log('Sector data entry completed for category:', category.id);
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorOnlyDataEntry;
