
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from '@/components/ui/export-buttons';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Building, Table } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface School {
  id: string;
  name: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  student_count: number;
  teacher_count: number;
}

interface ColumnData {
  column_id: string;
  column_name: string;
  column_type: string;
  category_name: string;
  value: string;
  status: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

interface EnhancedSchoolColumnTableProps {
  categoryId?: string;
}

const EnhancedSchoolColumnTable: React.FC<EnhancedSchoolColumnTableProps> = ({
  categoryId
}) => {
  const { t } = useLanguage();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolColumnData, setSchoolColumnData] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnDataLoading, setColumnDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [regions, setRegions] = useState([]);
  const [sectors, setSectors] = useState([]);

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
          fetchSchools()
        ]);
      } catch (err: any) {
        setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch filtered schools when filters change
  useEffect(() => {
    if (!loading) {
      fetchSchools();
    }
  }, [selectedRegion, selectedSector, searchQuery]);

  // Fetch school column data when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolColumnData(selectedSchool.id);
    }
  }, [selectedSchool, categoryId]);

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
      
      // Auto-select first school if none selected
      if (transformedSchools.length > 0 && !selectedSchool) {
        setSelectedSchool(transformedSchools[0]);
      }
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message || 'Məktəblər yüklənərkən xəta baş verdi');
    }
  };

  const fetchSchoolColumnData = async (schoolId: string) => {
    setColumnDataLoading(true);
    try {
      let query = supabase
        .from('data_entries')
        .select(`
          column_id,
          value,
          status,
          created_at,
          updated_at,
          columns!inner(
            name,
            type,
            is_required,
            order_index,
            categories!inner(name)
          )
        `)
        .eq('school_id', schoolId);

      // Filter by category if specified
      if (categoryId) {
        query = query.eq('columns.category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      const transformedData: ColumnData[] = (data || []).map(entry => ({
        column_id: entry.column_id,
        column_name: entry.columns?.name || 'N/A',
        column_type: entry.columns?.type || 'text',
        category_name: entry.columns?.categories?.name || 'N/A',
        value: entry.value || '',
        status: entry.status || 'pending',
        is_required: entry.columns?.is_required || false,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));
      
      // Sort by order_index manually after fetching
      const sortedData = transformedData.sort((a, b) => {
        const orderA = (data.find(d => d.column_id === a.column_id)?.columns?.order_index) || 0;
        const orderB = (data.find(d => d.column_id === b.column_id)?.columns?.order_index) || 0;
        return orderA - orderB;
      });
      
      setSchoolColumnData(sortedData);
    } catch (err: any) {
      console.error('Error fetching school column data:', err);
      setError(err.message || 'Məktəb məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setColumnDataLoading(false);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  const handleExport = async (format: string) => {
    if (!selectedSchool) {
      alert('Zəhmət olmasa bir məktəb seçin');
      return;
    }
    
    console.log(`Exporting ${selectedSchool.name} data as ${format}`);
    // TODO: Implement actual export functionality
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Table className="h-5 w-5" />
            {t('schoolColumnReportTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="search">Axtar:</Label>
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
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex justify-end">
        <ExportButtons 
          onExportExcel={() => handleExport('excel')}
          onExportPDF={() => handleExport('pdf')}
          onExportCSV={() => handleExport('csv')}
          isLoading={columnDataLoading}
          disabled={!selectedSchool}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Schools List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Məktəblər ({schools.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${
                      selectedSchool?.id === school.id
                        ? 'bg-primary/10 border-primary'
                        : 'border-border'
                    }`}
                    onClick={() => handleSchoolSelect(school)}
                  >
                    <div className="font-medium">{school.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {school.region_name} - {school.sector_name}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        Şagird: {school.student_count} | Müəllim: {school.teacher_count}
                      </div>
                      <Badge variant="outline">
                        {school.completion_rate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Selected School Column Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedSchool ? `${selectedSchool.name} - Sütun Məlumatları` : 'Məktəb seçin'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {columnDataLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : selectedSchool ? (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {schoolColumnData.length > 0 ? (
                    schoolColumnData.map((data, index) => (
                      <div key={`${data.column_id}-${index}`} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{data.column_name}</span>
                              {data.is_required && (
                                <Badge variant="secondary" className="text-xs">
                                  Məcburi
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {data.category_name} • {data.column_type}
                            </div>
                            <div className="mt-2">
                              <div className="text-sm">
                                <strong>Dəyər:</strong> {data.value || 'Daxil edilməyib'}
                              </div>
                            </div>
                          </div>
                          <div className="ml-2">
                            {getStatusBadge(data.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Bu məktəb üçün məlumat tapılmadı
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Sütun məlumatlarını görmək üçün sol tərəfdən bir məktəb seçin
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedSchoolColumnTable;
