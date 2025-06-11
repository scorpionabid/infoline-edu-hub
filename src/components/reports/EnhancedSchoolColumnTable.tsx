import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useEnhancedSchoolColumnReport } from '@/hooks/reports/useEnhancedSchoolColumnReport';
import ExportButtons from '@/components/reports/ExportButtons';

interface EnhancedSchoolColumnTableProps {
  categoryId?: string;
}

const EnhancedSchoolColumnTable: React.FC<EnhancedSchoolColumnTableProps> = ({ 
  categoryId 
}) => {
  const { t } = useLanguage();
  const [showColumnFilter, setShowColumnFilter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    toggleColumnSelection,
    selectAllColumns,
    clearColumnSelection,
    loadData
  } = useEnhancedSchoolColumnReport(categoryId);

  // Get unique regions and sectors for filtering
  const { regions, sectors } = useMemo(() => {
    if (!data?.schools) return { regions: [], sectors: [] };
    
    const uniqueRegions = [...new Map(data.schools.map(s => [s.region_id, {
      id: s.region_id, 
      name: s.region_name 
    }])).values()];
    const uniqueSectors = [...new Map(data.schools.map(s => [s.sector_id, {
      id: s.sector_id, 
      name: s.sector_name 
    }])).values()];
    
    return { 
      regions: uniqueRegions, 
      sectors: uniqueSectors 
    };
  }, [data?.schools]);

  // Paginated data
  const paginatedSchools = useMemo(() => {
    if (!data?.schools) return [];
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.schools.slice(startIndex, endIndex);
  }, [data?.schools, currentPage, pageSize]);

  const totalPages = Math.ceil((data?.schools?.length || 0) / pageSize);

  // Column selection state
  const columnSelectionState = useMemo(() => {
    if (!data?.columns) return 'none';
    
    const selectedCount = filters.columns.selected_column_ids.length;
    const totalCount = data.columns.length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  }, [data?.columns, filters.columns.selected_column_ids]);

  const handleSchoolSearch = useCallback((value: string) => {
    updateFilters({
      schools: { search: value }
    });
    setCurrentPage(1);
  }, [updateFilters]);

  const handleRegionFilter = useCallback((regionId: string) => {
    updateFilters({
      schools: { 
        region_id: regionId === 'all' ? undefined : regionId,
        sector_id: undefined
      }
    });
    setCurrentPage(1);
  }, [updateFilters]);

  const handleSectorFilter = useCallback((sectorId: string) => {
    updateFilters({
      schools: { 
        sector_id: sectorId === 'all' ? undefined : sectorId 
      }
    });
    setCurrentPage(1);
  }, [updateFilters]);

  const getStatusBadge = (completion_rate: number) => {
    if (completion_rate >= 80) {
      return <Badge className="bg-green-500 text-white">Yüksək</Badge>;
    } else if (completion_rate >= 50) {
      return <Badge className="bg-yellow-500 text-white">Orta</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">Aşağı</Badge>;
    }
  };

  const getValueDisplay = (value: string | number | null, type: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Boş</span>;
    }
    
    switch (type) {
      case 'date':
        return new Date(value as string).toLocaleDateString();
      case 'checkbox':
        return value ? '✓' : '✗';
      default:
        return String(value);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-green-600">✓</span>;
      case 'rejected':
        return <span className="text-red-600">✗</span>;
      case 'pending':
        return <span className="text-amber-600">⏳</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Məktəb və sütun məlumatları yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Kateqoriya seçin
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Yuxarıdakı filtrlər bölməsindən kateqoriya seçdikdən sonra bu bölmədə həmin kateqoriyanın sütunları və məktəb məlumatları görünəcək.
          </p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg max-w-md text-center">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Məsləhət:</strong> İlk mövcud kateqoriya avtomatik seçiləcək
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seçilmiş kateqoriya üçün məlumat yüklənir...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Məktəb-Sütun Məlumatları</CardTitle>
              {data.columns.length > 0 && data.columns[0].category_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  Kateqoriya: <span className="font-medium">{data.columns[0].category_name}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenilə
              </Button>
              
              {data.schools.length > 0 && (
                <ExportButtons 
                  data={data.schools}
                  filename={`school-column-report-${Date.now()}`}
                  title="Məktəb-Sütun Hesabatı"
                />
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* School search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Məktəb axtar..."
                value={filters.schools.search}
                onChange={(e) => handleSchoolSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Region filter */}
            <Select 
              value={filters.schools.region_id || 'all'} 
              onValueChange={handleRegionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün regionlar</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sector filter */}
            <Select 
              value={filters.schools.sector_id || 'all'} 
              onValueChange={handleSectorFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sektor seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün sektorlar</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Column filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Sütun Filtri
            </Button>
          </div>

          {/* Column selection panel */}
          {showColumnFilter && (
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Sütun Seçimi</span>
                    <Badge variant="outline">
                      {filters.columns.selected_column_ids.length} / {data.columns.length}
                    </Badge>
                    {data.columns.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({data.columns[0].category_name} kateqoriyası)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllColumns}
                      disabled={columnSelectionState === 'all'}
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Hamısını seç
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearColumnSelection}
                      disabled={columnSelectionState === 'none'}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Seçimi ləğv et
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                  {data.columns.map((column) => {
                    const isSelected = filters.columns.selected_column_ids.includes(column.id);
                    return (
                      <div
                        key={column.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={column.id}
                          checked={isSelected}
                          onCheckedChange={() => toggleColumnSelection(column.id)}
                        />
                        <label
                          htmlFor={column.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {column.name}
                          {column.is_required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Main data table */}
      <Card>
        <CardContent className="p-0">
          {data.schools.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Məlumat tapılmadı</h3>
              <p className="text-muted-foreground mb-2">
                {data.columns.length > 0 && data.columns[0].category_name ? 
                  `"${data.columns[0].category_name}" kateqoriyası üçün məlumat tapılmadı.` : 
                  'Filtrləri dəyişin və ya məlumatları yenilənin.'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Filtrlərə uyğun məktəb tapılmadı və ya məlumat daxil edilməyib.
              </p>
            </div>
          ) : (
            <div>
              <ScrollArea className="h-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[250px]">
                        Məktəb
                      </TableHead>
                      <TableHead className="min-w-[120px]">Region</TableHead>
                      <TableHead className="min-w-[120px]">Sektor</TableHead>
                      <TableHead className="min-w-[100px]">Tamamlanma</TableHead>
                      {filters.columns.selected_column_ids.length > 0 && 
                        data.columns
                          .filter(col => filters.columns.selected_column_ids.includes(col.id))
                          .map((column) => (
                            <TableHead key={column.id} className="min-w-[150px] text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{column.name}</span>
                                {column.is_required && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    Məcburi
                                  </Badge>
                                )}
                              </div>
                            </TableHead>
                          ))
                      }
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium">
                          <div>
                            <div className="font-medium">{school.name}</div>
                            {school.principal_name && (
                              <div className="text-xs text-muted-foreground">
                                Direktor: {school.principal_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{school.region_name}</TableCell>
                        <TableCell>{school.sector_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {school.completion_stats.completion_rate}%
                            </span>
                            {getStatusBadge(school.completion_stats.completion_rate)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {school.completion_stats.approved_count}/{school.completion_stats.total_required} təsdiqlənmiş
                          </div>
                        </TableCell>
                        {filters.columns.selected_column_ids.length > 0 && 
                          data.columns
                            .filter(col => filters.columns.selected_column_ids.includes(col.id))
                            .map((column) => {
                              const entry = school.columns[column.id];
                              return (
                                <TableCell key={column.id} className="text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                      {getValueDisplay(entry?.value || null, column.type)}
                                      {getStatusIcon(entry?.status)}
                                    </div>
                                    {entry?.updated_at && (
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(entry.updated_at).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              );
                            })
                        }
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    {data.schools.length} məktəbdən {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.schools.length)} göstərilir
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Əvvəlki
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Növbəti
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary statistics */}
      {data.schools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xülasə Statistikası</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.schools.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Ümumi məktəb sayı
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.columns.filter(col => filters.columns.selected_column_ids.includes(col.id)).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Seçilmiş sütun sayı
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    data.schools.reduce((sum, school) => sum + school.completion_stats.completion_rate, 0) / data.schools.length
                  )}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Ortalama tamamlanma
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {data.schools.filter(school => school.completion_stats.completion_rate >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Yüksək performanslı məktəb
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSchoolColumnTable;
