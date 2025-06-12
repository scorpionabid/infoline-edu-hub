import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building, BookOpen, Calendar, Users, Info, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSchoolCategories } from '@/hooks/categories/useCategoriesWithAssignment';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SchoolDataEntryManager from './SchoolDataEntryManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { cn } from '@/lib/utils';

interface SchoolAdminDataEntryProps {
  schoolId: string;
}

/**
 * SchoolAdmin Data Entry Component
 * 
 * Bu komponent SchoolAdmin-in kateqoriya seçib məlumat daxil etməsi üçündür.
 * Təkmilləşdirilmiş versiya: aktiv sütunlar, məktəb məlumatları, progress tracking
 * 
 * İş axını:
 * 1. SchoolAdmin kateqoriya seçir
 * 2. Məktəb məlumatları göstərilir  
 * 3. SchoolDataEntryManager açılır və aktiv sütunlar məlumat daxil edilir
 * 4. Progress və statistika izlənir
 */
export const SchoolAdminDataEntry: React.FC<SchoolAdminDataEntryProps> = ({
  schoolId
}) => {
  const user = useAuthStore(selectUser);
  
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [showDataEntry, setShowDataEntry] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Get school categories (assignment="all") - yalnız aktiv sütunlar
  const { data: categories, isLoading: categoriesLoading } = useSchoolCategories();

  // Get school info
  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school-info', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, principal_name, completion_rate')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });

  // Get data entry statistics
  const { data: entryStats, isLoading: statsLoading } = useQuery({
    queryKey: ['school-entry-stats', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_entries')
        .select('category_id, status')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      
      const stats = data.reduce((acc, entry) => {
        const categoryId = entry.category_id;
        if (!acc[categoryId]) {
          acc[categoryId] = { pending: 0, approved: 0, rejected: 0, total: 0 };
        }
        acc[categoryId][entry.status]++;
        acc[categoryId].total++;
        return acc;
      }, {} as Record<string, { pending: number; approved: number; rejected: number; total: number }>);
      
      return stats;
    },
    enabled: !!schoolId
  });

  const handleCategorySelect = (categoryId: string) => {
    const categoryIndex = categories?.findIndex(cat => cat.id === categoryId) || 0;
    setCurrentCategoryIndex(categoryIndex);
    setSelectedCategoryId(categoryId);
    setShowDataEntry(true);
  };

  const handleBackToCategories = () => {
    setShowDataEntry(false);
    setSelectedCategoryId('');
  };

  const handleNextCategory = () => {
    if (categories && currentCategoryIndex < categories.length - 1) {
      const nextIndex = currentCategoryIndex + 1;
      const nextCategory = categories[nextIndex];
      setCurrentCategoryIndex(nextIndex);
      setSelectedCategoryId(nextCategory.id);
    }
  };

  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      const prevIndex = currentCategoryIndex - 1;
      const prevCategory = categories![prevIndex];
      setCurrentCategoryIndex(prevIndex);
      setSelectedCategoryId(prevCategory.id);
    }
  };

  // Loading state
  if (categoriesLoading || schoolLoading) {
    return <LoadingSpinner />;
  }

  // Show data entry form if category is selected
  if (showDataEntry && selectedCategoryId) {
    return (
      <div className="h-full">
        <SchoolDataEntryManager
          schoolId={schoolId}
          categoryId={selectedCategoryId}
          onClose={handleBackToCategories}
          onComplete={() => {
            console.log('SchoolAdmin data entry completed');
            handleBackToCategories();
          }}
        />
      </div>
    );
  }

  // Show category selection with enhanced UI
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* School Info Header */}
      {school && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-blue-900">{school.name}</h1>
                <p className="text-sm text-blue-600 font-normal">
                  {school.principal_name && `Direktor: ${school.principal_name}`}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">İstifadəçi</p>
                  <p className="text-xs text-muted-foreground">{user?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Tamamlanma</p>
                  <p className="text-xs text-muted-foreground">{school.completion_rate || 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Son Giriş</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Məlumat Daxil Etmə
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Məktəbiniz üçün doldurulmalı olan kateqoriyalar (yalnız aktiv sütunlar)
          </p>
        </CardHeader>
      </Card>

      {/* Categories Grid with Enhanced Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.length > 0 ? (
          categories.map((category) => {
            const categoryStats = entryStats?.[category.id];
            const hasEntries = categoryStats && categoryStats.total > 0;
            const completionRate = hasEntries ? 
              Math.round((categoryStats.approved / Math.max(1, category.columns?.length || 1)) * 100) : 0;
            
            return (
              <Card 
                key={category.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                  "border-2 hover:border-primary/50",
                  hasEntries ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : 
                               "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                )}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="line-clamp-2">{category.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Description */}
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {category.columns?.length || 0} sahə
                      </Badge>
                      
                      {/* Completion Status */}
                      {hasEntries ? (
                        <Badge 
                          variant={completionRate >= 100 ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {completionRate}% tamamlandı
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Başlanmayıb
                        </Badge>
                      )}
                    </div>
                    
                    {/* Deadline if any */}
                    {category.deadline && (
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <Calendar className="h-3 w-3" />
                        <span>Son tarix: {new Date(category.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {/* Entry Statistics */}
                    {hasEntries && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-yellow-100 rounded">
                          <p className="font-medium text-yellow-700">{categoryStats.pending}</p>
                          <p className="text-yellow-600">Gözləyən</p>
                        </div>
                        <div className="text-center p-2 bg-green-100 rounded">
                          <p className="font-medium text-green-700">{categoryStats.approved}</p>
                          <p className="text-green-600">Təsdiqlənmiş</p>
                        </div>
                        <div className="text-center p-2 bg-red-100 rounded">
                          <p className="font-medium text-red-700">{categoryStats.rejected}</p>
                          <p className="text-red-600">Rədd edilmiş</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <Button 
                      className="w-full"
                      variant={hasEntries ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategorySelect(category.id);
                      }}
                    >
                      {hasEntries ? 'Məlumatları Redaktə Et' : 'Məlumat Daxil Et'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Hal-hazırda doldurulmalı kateqoriya tapılmadı
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Admin tərəfindən aktiv kateqoriyalar əlavə edildikdə burada görünəcək
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Info Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 text-amber-600" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-amber-900">Məlumat Daxil Etmə Qaydaları</h3>
                <p className="text-xs text-amber-700 mt-1">
                  Yalnız aktiv sütunlar göstərilir. Arxivlənmiş sütunlar məlumat daxil etmədə görünmür.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-amber-800">✅ Ediləcəklər:</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Hər kateqoriya üçün ayrı-ayrı məlumat daxil edin</li>
                    <li>• Məcburi sahələri (*) mütləq doldurun</li>
                    <li>• Məlumatlar avtomatik saxlanılır</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-amber-800">🎯 Status izahı:</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• <span className="font-medium">Gözləyən:</span> Təsdiq gözləyir</li>
                    <li>• <span className="font-medium">Təsdiqlənmiş:</span> Admin təsdiqləyib</li>
                    <li>• <span className="font-medium">Rədd edilmiş:</span> Düzəliş lazım</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDataEntry;
