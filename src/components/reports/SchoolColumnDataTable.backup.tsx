import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from '@/components/ui/export-buttons';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Building, Download, Filter, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface School {
  id: string;
  name: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  student_count: number;
  teacher_count: number;
}

interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

interface SchoolColumnData {
  school_id: string;
  school_name: string;
  region_name: string;
  sector_name: string;
  columns: {
    [columnId: string]: {
      value: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }
  };
}

const SchoolColumnDataTable: React.FC = () => {
  const { t } = useLanguage();
  
  // State management
  const [schools, setSchools] = useState<School[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);
  const [schoolColumnData, setSchoolColumnData] = useState<SchoolColumnData[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Data for dropdowns
  const [regions, setRegions] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // UI states
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // New states for enhancements
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  
  // Sorting states
  const [columnSort, setColumnSort] = useState<{ columnId: string; order: 'asc' | 'desc' | null }>({ columnId: '', order: null });

  const {
    userRole,
    loading: roleLoading,
    getPermissionsSummary
  } = useRoleBasedReports();

  const permissions = getPermissionsSummary();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRegions(),
          fetchSectors(),
          fetchCategories(),
          fetchColumns(), // Always fetch all columns initially
          fetchSchools()
        ]);
      } catch (err: any) {
        setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    if (!roleLoading) {
      loadInitialData();
    }
  }, [roleLoading]);

  // Fetch filtered data when filters change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchSchools();
        fetchColumns(); // Always refetch columns when category changes
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedRegion, selectedSector, selectedCategory]);

  // Separate effect for search query with longer debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchSchools();
      }
    }, 500); // 500ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter schools based on selection
  useEffect(() => {
    if (selectedSchoolIds.length > 0) {
      const filtered = schools.filter(school => selectedSchoolIds.includes(school.id));
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools(schools);
    }
  }, [selectedSchoolIds, schools]);

  // Fetch school-column data when columns or filtered schools change
  useEffect(() => {
    if (selectedColumnIds.length > 0 && (selectedSchoolIds.length > 0 ? filteredSchools.length > 0 : schools.length > 0)) {
      fetchSchoolColumnData();
    }
  }, [selectedColumnIds, filteredSchools, schools]);

  // Auto-select all columns when category changes and columns are loaded
  useEffect(() => {
    if (columns.length > 0 && selectedCategory !== 'all') {
      const activeColumns = columns.filter(col => col.category_id === selectedCategory);
      setSelectedColumnIds(activeColumns.map(col => col.id));
    } else if (selectedCategory === 'all') {
      setSelectedColumnIds([]);
    }
  }, [columns, selectedCategory]);

  const fetchRegions = async () => {
    try {
      let query = supabase.from('regions').select('id, name').eq('status', 'active');
      
      if (permissions?.restrictions.region_id) {
        query = query.eq('id', permissions.restrictions.region_id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setRegions(data || []);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  const fetchSectors = async () => {
    try {
      let query = supabase.from('sectors').select('id, name, region_id').eq('status', 'active');
      
      if (permissions?.restrictions.region_id) {
        query = query.eq('region_id', permissions.restrictions.region_id);
      }
      
      if (permissions?.restrictions.sector_id) {
        query = query.eq('id', permissions.restrictions.sector_id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setSectors(data || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchColumns = async () => {
    try {
      let query = supabase
        .from('columns')
        .select(`
          id,
          name,
          type,
          category_id,
          is_required,
          order_index,
          categories!inner(name)
        `)
        .eq('status', 'active');

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) throw error;
      
      const transformedColumns: Column[] = (data || []).map(col => ({
        id: col.id,
        name: col.name,
        type: col.type,
        category_id: col.category_id,
        category_name: col.categories?.name || 'N/A',
        is_required: col.is_required,
        order_index: col.order_index || 0,
      }));
      
      setColumns(transformedColumns);
    } catch (err) {
      console.error('Error fetching columns:', err);
    }
  };

  const fetchSchools = async () => {
    
    try {
      let query = supabase
        .from('schools')
        .select(`
          id,
          name,
          completion_rate,
          student_count,
          teacher_count,
          regions!inner(name),
          sectors!inner(name)
        `)
        .eq('status', 'active');

      // Apply role-based restrictions
      if (permissions?.restrictions.region_id) {
  
        query = query.eq('region_id', permissions.restrictions.region_id);
      }
      
      if (permissions?.restrictions.sector_id) {
  
        query = query.eq('sector_id', permissions.restrictions.sector_id);
      }
      
      if (permissions?.restrictions.school_id) {
  
        query = query.eq('id', permissions.restrictions.school_id);
      }

      // Apply user filters
      if (selectedRegion && selectedRegion !== 'all') {

        query = query.eq('region_id', selectedRegion);
      }
      
      if (selectedSector && selectedSector !== 'all') {

        query = query.eq('sector_id', selectedSector);
      }
      
      if (searchQuery) {

        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('name');
      

      
      if (error) throw error;
      
      const transformedSchools = (data || []).map(school => ({
        id: school.id,
        name: school.name,
        region_name: school.regions?.name || 'N/A',
        sector_name: school.sectors?.name || 'N/A',
        completion_rate: school.completion_rate || 0,
        student_count: school.student_count || 0,
        teacher_count: school.teacher_count || 0,
      }));
      

      setSchools(transformedSchools);
      
      // Update pagination
      setTotalPages(Math.ceil(transformedSchools.length / pageSize));
      if (currentPage > Math.ceil(transformedSchools.length / pageSize)) {
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message || 'Məktəblər yüklənərkən xəta baş verdi');
    }
  };

  const fetchSchoolColumnData = async () => {
    const schoolsToUse = selectedSchoolIds.length > 0 ? filteredSchools : schools;
    if (selectedColumnIds.length === 0 || schoolsToUse.length === 0) return;
    
    setDataLoading(true);
    try {
      const schoolIds = schoolsToUse.map(s => s.id);
      
      const { data, error } = await supabase
        .from('data_entries')
        .select(`
          school_id,
          column_id,
          value,
          status,
          created_at,
          updated_at
        `)
        .in('school_id', schoolIds)
        .in('column_id', selectedColumnIds);
      
      if (error) throw error;
      
      // Transform data into structured format
      const schoolDataMap: { [schoolId: string]: SchoolColumnData } = {};
      
      // Initialize with school info
      schoolsToUse.forEach(school => {
        schoolDataMap[school.id] = {
          school_id: school.id,
          school_name: school.name,
          region_name: school.region_name,
          sector_name: school.sector_name,
          columns: {}
        };
      });
      
      // Add column data
      (data || []).forEach(entry => {
        if (schoolDataMap[entry.school_id]) {
          schoolDataMap[entry.school_id].columns[entry.column_id] = {
            value: entry.value,
            status: entry.status,
            created_at: entry.created_at,
            updated_at: entry.updated_at
          };
        }
      });
      
      let schoolData = Object.values(schoolDataMap);

      // Apply sorting if active
      if (columnSort.order && columnSort.columnId) {
        schoolData = schoolData.sort((a, b) => {
          const aValue = a.columns[columnSort.columnId]?.value || '';
          const bValue = b.columns[columnSort.columnId]?.value || '';
          
          // String comparison
          const comparison = aValue.toString().localeCompare(bValue.toString());
          
          return columnSort.order === 'asc' ? comparison : -comparison;
        });
      }
      
      setSchoolColumnData(schoolData);
    } catch (err: any) {
      console.error('Error fetching school column data:', err);
      setError(err.message || 'Məktəb sütun məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setDataLoading(false);
    }
  };

  const handleColumnSelect = (columnId: string, checked: boolean) => {
    if (checked) {
      setSelectedColumnIds(prev => [...prev, columnId]);
    } else {
      setSelectedColumnIds(prev => prev.filter(id => id !== columnId));
    }
  };

  const handleSchoolSelect = (schoolId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchoolIds(prev => [...prev, schoolId]);
    } else {
      setSelectedSchoolIds(prev => prev.filter(id => id !== schoolId));
    }
  };

  const handleSelectAllSchools = (checked: boolean) => {
    if (checked) {
      setSelectedSchoolIds(schools.map(school => school.id));
    } else {
      setSelectedSchoolIds([]);
    }
  };

  const handleSelectAllColumns = (checked: boolean) => {
    if (checked) {
      setSelectedColumnIds(columns.map(col => col.id));
    } else {
      setSelectedColumnIds([]);
    }
  };

  const handleColumnSort = (columnId: string) => {
    setColumnSort(prev => {
      if (prev.columnId === columnId) {
        // Cycle through: asc -> desc -> null
        if (prev.order === 'asc') {
          return { columnId, order: 'desc' };
        } else if (prev.order === 'desc') {
          return { columnId: '', order: null };
        }
      }
      return { columnId, order: 'asc' };
    });
  };

  const getSortIcon = (columnId: string) => {
    if (columnSort.columnId !== columnId) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (columnSort.order === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (columnSort.order === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'approved': { variant: 'default', label: 'Təsdiqlənmiş', className: 'bg-green-100 text-green-800' },
      'pending': { variant: 'secondary', label: 'Gözləmədə', className: 'bg-yellow-100 text-yellow-800' },
      'rejected': { variant: 'destructive', label: 'Rədd edilmiş', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleExport = async (format: string) => {
    if (selectedColumnIds.length === 0) {
      alert('Ən azı bir sütun seçin');
      return;
    }
    
    const selectedColumnsData = columns.filter(col => selectedColumnIds.includes(col.id));
    const exportData = schoolColumnData.map(schoolData => {
      const row: any = {
        'Məktəb': schoolData.school_name,
        'Region': schoolData.region_name,
        'Sektor': schoolData.sector_name
      };
      
      selectedColumnsData.forEach(col => {
        const columnData = schoolData.columns[col.id];
        row[col.name] = columnData?.value || 'Daxil edilməyib';
        row[`${col.name} - Status`] = columnData?.status || 'pending';
      });
      
      return row;
    });
    
    console.log(`Exporting ${exportData.length} rows as ${format}`, exportData);
    
    if (format === 'excel') {
      try {
        // Import XLSX dynamically
// @ts-ignore
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Məktəb Məlumatları");
        XLSX.writeFile(wb, `məktəb-sütun-məlumatları-${new Date().toISOString().split('T')[0]}.xlsx`);
      } catch (error) {
        console.error('Excel export error:', error);
        alert('Excel ixracında xəta baş verdi');
      }
    } else if (format === 'csv') {
      // Simple CSV export
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `məktəb-sütun-məlumatları-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Məlumatlar yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const selectedColumns = columns.filter(col => selectedColumnIds.includes(col.id));
  
  // Paginated data
  const paginatedSchoolData = schoolColumnData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtrlər və Sütun Seçimi
                </div>
                {filtersOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Top row: Basic filters */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {/* Search Input */}
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="search">Məktəb Axtar:</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Məktəb adı ilə axtar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Region Filter */}
                {!permissions?.restrictions.region_id && (
                  <div>
                    <Label htmlFor="region">Region:</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Bütün Regionlar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Bütün Regionlar</SelectItem>
                        {regions.map((region: any) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sector Filter */}
                {!permissions?.restrictions.sector_id && (
                  <div>
                    <Label htmlFor="sector">Sektor:</Label>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger id="sector">
                        <SelectValue placeholder="Bütün Sektorlar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Bütün Sektorlar</SelectItem>
                        {sectors
                          .filter((sector: any) => !selectedRegion || selectedRegion === 'all' || sector.region_id === selectedRegion)
                          .map((sector: any) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Second row: Category selection, Page Size and Reset button */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <div>
                  <Label htmlFor="category">Kateqoriya:</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kateqoriya seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Bütün Kateqoriyalar</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Page Size Selector */}
                <div>
                  <Label htmlFor="pageSize">Səhifə ölçüsü:</Label>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1); // Reset to first page
                  }}>
                    <SelectTrigger id="pageSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 məktəb</SelectItem>
                      <SelectItem value="25">25 məktəb</SelectItem>
                      <SelectItem value="50">50 məktəb</SelectItem>
                      <SelectItem value="100">100 məktəb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Reset Button */}
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRegion('all');
                      setSelectedSector('all');
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setSelectedColumnIds([]);
                      setSelectedSchoolIds([]);
                      setCurrentPage(1);
                      setColumnSort({ columnId: '', order: null });
                    }}
                    className="w-full"
                  >
                    Filtrləri Sıfırla
                  </Button>
                </div>
              </div>

              {/* School Selection */}
              {schools.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Məktəbləri Seçin ({selectedSchoolIds.length}/{schools.length} seçilib):</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllSchools(true)}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Hamısını Seç
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllSchools(false)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Seçimi Təmizlə
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {schools.map((school) => (
                        <div key={school.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={school.id}
                            checked={selectedSchoolIds.includes(school.id)}
                            onCheckedChange={(checked) => handleSchoolSelect(school.id, checked as boolean)}
                          />
                          <Label htmlFor={school.id} className="text-sm cursor-pointer flex-1">
                            {school.name}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({school.sector_name})
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Column Selection - Only show when category is selected */}
              {columns.length > 0 && selectedCategory !== 'all' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Sütunları Seçin ({selectedColumnIds.length}/{columns.length} seçilib):</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllColumns(true)}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Hamısını Seç
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllColumns(false)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Seçimi Təmizlə
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      {columns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.id}
                            checked={selectedColumnIds.includes(column.id)}
                            onCheckedChange={(checked) => handleColumnSelect(column.id, checked as boolean)}
                          />
                          <Label htmlFor={column.id} className="text-sm cursor-pointer">
                            {column.name}
                            {column.is_required && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                Məcburi
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Third row: Column selection - Show for all categories */}
              {columns.length > 0 && selectedCategory === 'all' && (
                <div>
                  <Label>Sütunları Seçin ({selectedColumnIds.length} seçilib):</Label>
                  <div className="mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      {columns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.id}
                            checked={selectedColumnIds.includes(column.id)}
                            onCheckedChange={(checked) => handleColumnSelect(column.id, checked as boolean)}
                          />
                          <Label htmlFor={column.id} className="text-sm cursor-pointer">
                            {column.name}
                            {column.is_required && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                Məcburi
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Export Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {schools.length} məktəb taplandı
          {selectedSchoolIds.length > 0 && (
            <>, {selectedSchoolIds.length} məktəb seçilib</>
          )}
          {selectedColumns.length > 0 && (
            <>, {selectedColumns.length} sütun seçilib</>
          )}
          {schoolColumnData.length > 0 && (
            <>
              {` | ${schoolColumnData.length} məktəb cədvəldə`}
              {schoolColumnData.length > pageSize && (
                ` | Səhifə ${currentPage}/${Math.ceil(schoolColumnData.length / pageSize)} (${pageSize} məktəb/səhifə)`
              )}
            </>
          )}
        </div>
        <ExportButtons 
          onExportExcel={() => handleExport('excel')}
          onExportPDF={() => handleExport('pdf')}
          onExportCSV={() => handleExport('csv')}
          isLoading={dataLoading}
          disabled={selectedColumnIds.length === 0 || schoolColumnData.length === 0}
        />
      </div>

      {/* Data Table */}
      {selectedColumnIds.length > 0 && (selectedSchoolIds.length > 0 || selectedSchoolIds.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Məktəb-Sütun Məlumatları Cədvəli
              {columnSort.order && (
                <Badge variant="outline" className="ml-2">
                  Sıralanıb: {columns.find(c => c.id === columnSort.columnId)?.name} 
                  ({columnSort.order === 'asc' ? 'A-Z' : 'Z-A'})
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Məlumatlar yüklənir...</span>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-96 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Məktəb</TableHead>
                      <TableHead className="w-[150px]">Sektor</TableHead>
                      {selectedColumns.map((column) => (
                        <TableHead key={column.id} className="min-w-[150px]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {column.name}
                              {column.is_required && (
                                <Badge variant="outline" className="text-xs">
                                  Məcburi
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-muted"
                              onClick={() => handleColumnSort(column.id)}
                              title="Sırala"
                            >
                              {getSortIcon(column.id)}
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSchoolData.map((schoolData) => (
                      <TableRow key={schoolData.school_id}>
                        <TableCell className="font-medium">
                          {schoolData.school_name}
                        </TableCell>
                        <TableCell>{schoolData.sector_name}</TableCell>
                        {selectedColumns.map((column) => {
                          const columnData = schoolData.columns[column.id];
                          return (
                            <TableCell key={column.id}>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {columnData?.value || (
                                    <span className="text-muted-foreground italic">
                                      Daxil edilməyib
                                    </span>
                                  )}
                                </div>
                                {columnData && (
                                  <div className="flex items-center gap-1">
                                    {getStatusBadge(columnData.status)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
            
            {/* Pagination */}
            {schoolColumnData.length > pageSize && (
              <div className="flex justify-center items-center pt-4 space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Əvvəlki
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.ceil(schoolColumnData.length / pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(schoolColumnData.length / pageSize);
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    })
                  }
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(Math.ceil(schoolColumnData.length / pageSize), currentPage + 1))}
                  disabled={currentPage === Math.ceil(schoolColumnData.length / pageSize)}
                >
                  Növbəti
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {selectedColumnIds.length === 0 ? 'Kateqoriya və Sütun Seçin' : 'Məktəb Seçin'}
            </h3>
            <p className="text-muted-foreground">
              {selectedColumnIds.length === 0 
                ? 'Məktəb məlumatlarını görmək üçün əvvəlcə kateqoriya seçin və sütunlar avtomatik seçiləcək.' 
                : 'Məlumatları görmək üçün ən azı bir məktəb seçin və ya axtarış/filtrlərə uyğun məktəblər olduğundan əmin olun.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolColumnDataTable;