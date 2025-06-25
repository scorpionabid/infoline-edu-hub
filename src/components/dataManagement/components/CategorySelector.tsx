import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Building2, 
  Loader2,
  BookOpen
} from 'lucide-react';
import { Category } from '@/hooks/dataManagement/useDataManagement';

interface CategorySelectorProps {
  categories: Category[];
  loading: boolean;
  onCategorySelect: (category: Category) => void;
  permissions: {
    canApprove: boolean;
    canEdit: boolean;
    canViewAll: boolean;
    role: string;
    sectorId?: string;
    regionId?: string;
  };
}

/**
 * Category Selector Component
 * 
 * Displays available categories in a grid layout with completion indicators.
 * Categories are filtered based on user role and permissions.
 */
export const CategorySelector: React.FC<CategorySelectorProps> = memo(({
  categories,
  loading,
  onCategorySelect,
  permissions
}) => {
  // Filter categories based on role
  const filteredCategories = categories.filter(category => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Filtering category:', {
        name: category.name,
        assignment: category.assignment,
        role: permissions.role,
        canViewAll: permissions.canViewAll
      });
    }
    
    // Get actual role from multiple sources (fallback strategy)
    const actualRole = permissions.role || (permissions.sectorId ? 'sectoradmin' : permissions.regionId ? 'regionadmin' : 'schooladmin');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Actual role determined:', actualRole);
    }
    
    // SuperAdmin can see all categories - fixed comparison
    if (permissions.canViewAll || actualRole === 'superadmin') {
      if (process.env.NODE_ENV === 'development') {
        console.log('superadmin/canViewAll = true, including category');
      }
      return true;
    }
    
    // RegionAdmin can see all categories but NOT select sector categories
    if (actualRole === 'regionadmin') {
      if (process.env.NODE_ENV === 'development') {
        console.log('regionadmin check:', { assignment: category.assignment, included: true });
      }
      return true;
    }
    
    // SectorAdmin can see 'all' and 'sectors' categories
    if (actualRole === 'sectoradmin') {
      const shouldInclude = category.assignment === 'all' || category.assignment === 'sectors';
      if (process.env.NODE_ENV === 'development') {
        console.log('sectoradmin check:', { shouldInclude, assignment: category.assignment });
      }
      return shouldInclude;
    }
    
    // SchoolAdmin can only see 'all' categories
    const shouldInclude = category.assignment === 'all';
    if (process.env.NODE_ENV === 'development') {
      console.log('schooladmin/default check:', { shouldInclude, assignment: category.assignment });
    }
    return shouldInclude;
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Final filtered categories:', filteredCategories.length, filteredCategories);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Kateqoriyalar yüklənir...</h3>
          <p className="text-muted-foreground">
            Məlumat kateqoriyaları hazırlanır
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Kateqoriya tapılmadı</h3>
        <p className="text-muted-foreground mb-4">
          Sizin rolunuz üçün əlçatan kateqoriya yoxdur
        </p>
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded inline-block">
          Rol: {permissions.role} • 
          Icazələr: {permissions.canEdit ? 'Redaktə' : ''} {permissions.canApprove ? 'Təsdiq' : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Kateqoriya Seçimi</h3>
        <p className="text-muted-foreground">
          Məlumat daxil etmək və ya idarə etmək istədiyiniz kateqoriyanı seçin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          // Get actual role for RegionAdmin restriction
          const actualRole = permissions.role || (permissions.sectorId ? 'sectoradmin' : permissions.regionId ? 'regionadmin' : 'schooladmin');
          
          // RegionAdmin cannot select sector categories (but can see them)
          const isDisabled = actualRole === 'regionadmin' && category.assignment === 'sectors';
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500 ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed hover:shadow-none' 
                  : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
              onClick={() => {
                if (!isDisabled) {
                  onCategorySelect(category);
                }
              }}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-label={`${category.name} kateqoriyasını seç`}
              aria-disabled={isDisabled}
              onKeyDown={(e) => {
                if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onCategorySelect(category);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg flex items-center gap-2 transition-colors ${
                    isDisabled ? 'text-gray-400' : 'group-hover:text-blue-600'
                  }`}>
                    {category.assignment === 'sectors' ? (
                      <Database className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-green-600" />
                    )}
                    {category.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={category.assignment === 'sectors' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {category.assignment === 'sectors' ? 'Sektor' : 'Məktəb'}
                    </Badge>
                    {isDisabled && (
                      <Badge variant="destructive" className="text-xs">
                        Giriş yoxdur
                      </Badge>
                    )}
                  </div>
                </div>
                {category.description && (
                  <p className={`text-sm mt-2 ${
                    isDisabled ? 'text-gray-400' : 'text-muted-foreground'
                  }`}>
                    {category.description}
                  </p>
                )}
              </CardHeader>
              
              {category.completion_rate !== undefined && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tamamlanma</span>
                      <span className="font-medium">
                        {category.completion_rate}%
                      </span>
                    </div>
                    <Progress 
                      value={category.completion_rate} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Role-based help text */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
          <span>
            {permissions.role === 'sectoradmin' && 'Sektor adminləri bütün kateqoriyaları idarə edə bilər'}
            {permissions.role === 'regionadmin' && 'Region adminləri bütün kateqoriyaları idarə edə bilər'}
            {permissions.role === 'superadmin' && 'SuperAdmin bütün kateqoriyaları idarə edə bilər'}
            {permissions.role === 'schooladmin' && 'Məktəb adminləri yalnız məktəb kateqoriyalarını görə bilər'}
          </span>
        </div>
      </div>
    </div>
  );
});
