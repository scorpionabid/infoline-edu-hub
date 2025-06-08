
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Folder } from 'lucide-react';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SchoolDataEntryForm from './school/SchoolDataEntryForm';

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
                    </CardTitle>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <SchoolDataEntryForm
                      categoryId={category.id}
                      schoolId={schoolId}
                      onComplete={onComplete}
                    />
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
