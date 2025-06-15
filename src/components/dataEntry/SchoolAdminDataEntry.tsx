
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useCategories } from '@/hooks/categories/useCategories';
import { BookOpen, Calendar, Clock } from 'lucide-react';

const SchoolAdminDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const { categories, loading } = useCategories({ 
    assignment: 'schools',
    enabled: !!user?.school_id 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Kateqoriyalar yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Məktəb Məlumat Daxiletməsi
          </CardTitle>
          <p className="text-muted-foreground">
            Məktəbiniz üçün məlumat daxil edin
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{category.name}</h3>
                    {category.deadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(category.deadline).toLocaleDateString('az-AZ')}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to data entry form for this category
                      console.log('Starting data entry for category:', category.id);
                    }}
                  >
                    Məlumat Daxil Et
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Kateqoriya tapılmadı</h3>
              <p className="text-muted-foreground">
                Hazırda məktəbiniz üçün aktiv kateqoriya yoxdur
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDataEntry;
