import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Filter, User, Shield, Building, School } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import CreateReportDialog from './CreateReportDialog';
import { useRoleBasedFilters } from '@/hooks/reports/useRoleBasedReports';

interface FilterState {
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
}

export interface ReportHeaderEnhancedProps {
  onCategorySelect?: (categoryId: string) => void;
  onFiltersChange?: (filters: FilterState) => void;
  title?: string;
  description?: string;
}

export const ReportHeader: React.FC<ReportHeaderEnhancedProps> = ({ 
  onCategorySelect,
  onFiltersChange,
  title, 
  description 
}) => {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [hasAutoSelectedCategory, setHasAutoSelectedCategory] = useState(false);

  // Load categories
  const { categories } = useCategories();

  const {
    userRole,
    loading,
    availableRegions,
    availableSectors,
    availableSchools,
    filterOptions
  } = useRoleBasedFilters();

  // Auto-select first category when categories are loaded
  useEffect(() => {
    if (!hasAutoSelectedCategory && categories.length > 0 && !filters.category_id) {
      const firstCategory = categories[0];
      const newFilters = { ...filters, category_id: firstCategory.id };
      setFilters(newFilters);
      setHasAutoSelectedCategory(true);
      onCategorySelect?.(firstCategory.id);
      onFiltersChange?.(newFilters);
    }
  }, [categories, hasAutoSelectedCategory, filters.category_id]); // Remove callback dependencies to avoid loops

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    
    // Special handling for category selection
    if (key === 'category_id') {
      onCategorySelect?.(value === 'all' ? '' : value);
    }
  };

  const handleCreate = async (data: { title: string; description: string; type: string }) => {
    try {
      // Handle report creation
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="h-4 w-4" />;
      case 'regionadmin':
        return <Building className="h-4 w-4" />;
      case 'sectoradmin':
        return <Building className="h-4 w-4" />;
      case 'schooladmin':
        return <School className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames = {
      superadmin: 'Super Administrator',
      regionadmin: 'Region Administratoru',
      sectoradmin: 'Sektor Administratoru',
      schooladmin: 'Məktəb Administratoru'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'regionadmin':
        return 'secondary';
      case 'sectoradmin':
        return 'outline';
      case 'schooladmin':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title || t('reports')}</h1>
          <p className="text-muted-foreground mt-1">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with title and role info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{title || t('reports')}</h1>
          <p className="text-muted-foreground mt-1">
            {description || t('reportsDescription')}
          </p>
          {userRole && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getRoleBadgeVariant(userRole.role)} className="flex items-center gap-1">
                {getRoleIcon(userRole.role)}
                {getRoleDisplayName(userRole.role)}
              </Badge>
              {userRole.role !== 'superadmin' && (
                <span className="text-sm text-muted-foreground">
                  - Məhdud giriş səlahiyyəti
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrlər
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hesabat
          </Button>
        </div>
      </div>

      {/* Role-based filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hesabat Filtrləri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Region filter - only for superadmin */}
              {filterOptions.canSelectRegion && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select 
                    value={filters.region_id || 'all'} 
                    onValueChange={(value) => handleFilterChange('region_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Region seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Bütün regionlar</SelectItem>
                      {availableRegions.map(region => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sector filter - for superadmin and regionadmin */}
              {filterOptions.canSelectSector && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sektor</label>
                  <Select 
                    value={filters.sector_id || 'all'} 
                    onValueChange={(value) => handleFilterChange('sector_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sektor seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Bütün sektorlar</SelectItem>
                      {availableSectors.map(sector => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* School filter - for superadmin, regionadmin, and sectoradmin */}
              {filterOptions.canSelectSchool && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Məktəb</label>
                  <Select 
                    value={filters.school_id || 'all'} 
                    onValueChange={(value) => handleFilterChange('school_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Məktəb seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Bütün məktəblər</SelectItem>
                      {availableSchools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category filter - available for all */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Kateqoriya</label>
                <Select 
                  value={filters.category_id || 'all'} 
                  onValueChange={(value) => handleFilterChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün kateqoriyalar</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters summary */}
            {Object.values(filters).some(value => value) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium">Aktiv filtrlər:</span>
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null;
                    
                    let label = '';
                    switch (key) {
                      case 'region_id':
                        label = availableRegions.find(r => r.id === value)?.name || value;
                        break;
                      case 'sector_id':
                        label = availableSectors.find(s => s.id === value)?.name || value;
                        break;
                      case 'school_id':
                        label = availableSchools.find(s => s.id === value)?.name || value;
                        break;
                      default:
                        label = value;
                    }
                    
                    return (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    );
                  })}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setFilters({});
                      onFiltersChange?.({});
                      onCategorySelect?.('');
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Təmizlə
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role restrictions info */}
      {userRole && userRole.role !== 'superadmin' && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            📋 <strong>Qeyd:</strong> 
            {userRole.role === 'regionadmin' && ' Siz yalnız öz regionunuzdakı məlumatları görə bilərsiniz.'}
            {userRole.role === 'sectoradmin' && ' Siz yalnız öz sektorunuzdakı məlumatları görə bilərsiniz.'}
            {userRole.role === 'schooladmin' && ' Siz yalnız öz məktəbinizin məlumatlarını görə bilərsiniz.'}
          </p>
        </div>
      )}

      <CreateReportDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ReportHeader;
