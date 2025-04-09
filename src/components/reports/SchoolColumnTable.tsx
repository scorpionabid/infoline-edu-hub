import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolColumnReport } from '@/hooks/useSchoolColumnReport';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, Search, CheckSquare, X } from 'lucide-react';
import { useCachedQuery } from '@/hooks/useCachedQuery';

const SchoolColumnTable: React.FC = () => {
  const { t } = useLanguage();
  const {
    data,
    loading,
    error,
    categoryId,
    setCategoryId,
    regionId,
    setRegionId,
    sectorId,
    setSectorId,
    statusFilter,
    setStatusFilter,
    loadData,
    exportToExcel
  } = useSchoolColumnReport();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const { data: categoriesData, isLoading: categoriesLoading } = useCachedQuery(['categories'], async () => {
    return [];
  });
  
  const { data: regionsData, isLoading: regionsLoading } = useCachedQuery(['regions'], async () => {
    return [];
  });
  
  const { data: sectorsData, isLoading: sectorsLoading } = useCachedQuery(
    ['sectors', regionId], 
    async () => {
      return [];
    },
    { 
      enabled: !!regionId,
      queryKey: ['sectors', regionId]
    }
  );

  // Kateqoriyalar
  const categories = categoriesData || [];
  const regions = regionsData || [];
  const sectors = sectorsData || [];

  // Filtirlənmiş məlumatlar
  const filteredData = data.filter(school => 
    school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hamısını seç/ləğv et
  useEffect(() => {
    if (selectAll) {
      setSelectedSchools(filteredData.map(school => school.schoolId));
    } else {
      setSelectedSchools([]);
    }
  }, [selectAll, filteredData]);

  // Məktəbi seç/ləğv et
  const toggleSchoolSelection = (schoolId: string) => {
    if (selectedSchools.includes(schoolId)) {
      setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
    } else {
      setSelectedSchools([...selectedSchools, schoolId]);
    }
  };

  // Status filtri dəyişdikdə
  const handleStatusFilterChange = (status: 'pending' | 'approved' | 'rejected', checked: boolean) => {
    setStatusFilter({
      ...statusFilter,
      [status]: checked
    });
  };

  // Bütün filtrləri sıfırla
  const resetFilters = () => {
    setCategoryId(undefined);
    setRegionId(undefined);
    setSectorId(undefined);
    setStatusFilter({
      pending: true,
      approved: true,
      rejected: false
    });
    setSearchTerm('');
  };

  // Sektorları yenilə (region dəyişdikdə)
  useEffect(() => {
    // Region dəyişdikdə sektoru sıfırla
    if (regionId) {
      setSectorId(undefined);
    }
  }, [regionId, setSectorId]);

  // Status badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">{t('approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('rejected')}</Badge>;
      default:
        return <Badge variant="outline">{t('pending')}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Yuxarı panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? t('hideFilters') : t('showFilters')}
          </Button>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchSchool')}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {selectedSchools.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{selectedSchools.length}</span>
              <span>{t('schoolsSelected')}</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToExcel}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('excelExport')}
          </Button>
        </div>
      </div>
      
      {/* Filtrlər */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{t('filters')}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
              >
                {t('resetFilters')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Kateqoriya seçimi */}
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('selectCategory')}</label>
                <Select 
                  value={categoryId} 
                  onValueChange={(value) => setCategoryId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                    ) : categories && Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>{t('noCategories')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Region seçimi */}
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('selectRegion')}</label>
                <Select 
                  value={regionId} 
                  onValueChange={(value) => setRegionId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {regionsLoading ? (
                      <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                    ) : regions && Array.isArray(regions) && regions.length > 0 ? (
                      regions.map((region: any) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>{t('noRegions')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sektor seçimi */}
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('selectSector')}</label>
                <Select 
                  value={sectorId} 
                  onValueChange={(value) => setSectorId(value)}
                  disabled={!regionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={regionId ? t('selectSector') : t('selectRegionFirst')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorsLoading ? (
                      <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                    ) : sectors && Array.isArray(sectors) && sectors.length > 0 ? (
                      sectors.map((sector: any) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>{regionId ? t('noSectors') : t('selectRegionFirst')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('status')}</label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pending" 
                      checked={statusFilter.pending}
                      onCheckedChange={(checked) => handleStatusFilterChange('pending', checked as boolean)}
                    />
                    <label htmlFor="pending" className="text-sm">{t('pending')}</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="approved" 
                      checked={statusFilter.approved}
                      onCheckedChange={(checked) => handleStatusFilterChange('approved', checked as boolean)}
                    />
                    <label htmlFor="approved" className="text-sm">{t('approved')}</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rejected" 
                      checked={statusFilter.rejected}
                      onCheckedChange={(checked) => handleStatusFilterChange('rejected', checked as boolean)}
                    />
                    <label htmlFor="rejected" className="text-sm">{t('rejected')}</label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cədvəl */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectAll && filteredData.length > 0}
                  onCheckedChange={(checked) => setSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="min-w-[180px]">{t('schoolName')}</TableHead>
              <TableHead>{t('region')}</TableHead>
              <TableHead>{t('sector')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              
              {/* Dinamik sütunlar - real datada kateqoriyadan gələcək */}
              {filteredData.length > 0 && filteredData[0].columnData.map((_, index) => (
                <TableHead key={index}>Sütun {index + 1}</TableHead>
              ))}
              
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Yüklənmə skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              // Xəta mesajı
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              // Məlumat yoxdur
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('noDataAvailable')}
                  <p className="mt-2 text-sm">{t('selectAnotherCategory')}</p>
                </TableCell>
              </TableRow>
            ) : (
              // Məlumatları göstər
              filteredData.map((school) => (
                <TableRow key={school.schoolId}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedSchools.includes(school.schoolId)}
                      onCheckedChange={() => toggleSchoolSelection(school.schoolId)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{school.schoolName}</TableCell>
                  <TableCell>{school.region}</TableCell>
                  <TableCell>{school.sector}</TableCell>
                  <TableCell>{getStatusBadge(school.status)}</TableCell>
                  
                  {/* Dinamik sütun məlumatları */}
                  {school.columnData.map((col, index) => (
                    <TableCell key={index}>{col.value || "-"}</TableCell>
                  ))}
                  
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      {t('viewDetails')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SchoolColumnTable;
