import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useSchoolCategories } from '@/hooks/categories/useCategoriesWithAssignment';
import SchoolDataEntryManager from './SchoolDataEntryManager';
import { FileText, Calendar, Users, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

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
  const user = useAuthStore(state => state.user);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Məktəb kateqoriyalarını yükləyir (yalnız aktiv sütunlarla)
  const { 
    data: categories = [], 
    isLoading, 
    error 
  } = useSchoolCategories();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Kateqoriyalar yüklənir...</span>
      </div>
    );
  }

  if (error) {
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
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    
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

        {/* Data Entry Manager */}
        <SchoolDataEntryManager
          schoolId={user.school_id}
          categoryId={selectedCategoryId}
          userId={user.id}
        />
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
