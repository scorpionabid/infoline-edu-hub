import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { useSchoolData } from '@/hooks/schools/useSchoolData';
import { useRegions } from '@/context/RegionsContext';
import { useSectors } from '@/hooks/sectors/useSectors';
import { ensureValidSchoolStatus } from '@/utils/buildFixes';

const Schools = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'deleted'>('active');
  const [filters, setFilters] = useState({
    region: '',
    sector: '',
    type: '',
    status: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch data
  const { 
    data: schools = [], 
    isLoading: schoolsLoading, 
    error: schoolsError,
    refetch: refetchSchools 
  } = useSchoolData({
    page: currentPage,
    pageSize,
    search: searchQuery,
    status: activeTab,
    regionId: filters.region || undefined,
    sectorId: filters.sector || undefined,
    type: filters.type || undefined
  });

  const { regions, isLoading: regionsLoading } = useRegions();
  const { data: sectors = [], isLoading: sectorsLoading } = useSectors();

  // Process schools data with type safety
  const processedSchools = useMemo(() => {
    return schools.map(school => ({
      ...school,
      status: ensureValidSchoolStatus(school.status || 'active')
    }));
  }, [schools]);

  // Create lookup maps
  const regionNames = useMemo(() => {
    return regions.reduce((acc, region) => {
      acc[region.id] = region.name;
      return acc;
    }, {} as Record<string, string>);
  }, [regions]);

  const sectorNames = useMemo(() => {
    return sectors.reduce((acc, sector) => {
      acc[sector.id] = sector.name;
      return acc;
    }, {} as Record<string, string>);
  }, [sectors]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({ region: '', sector: '', type: '', status: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSchoolUpdate = () => {
    refetchSchools();
  };

  const handleSchoolDelete = () => {
    refetchSchools();
  };

  const isLoading = schoolsLoading || regionsLoading || sectorsLoading;

  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                {t('schools')}
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t('schoolsDescription')}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-white to-slate-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {t('schoolManagement')}
                </CardTitle>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder={t('searchSchools')}
                      className="w-full sm:w-[280px] pl-12 pr-4 py-3 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {t('filters')}
                  </Button>
                </div>
              </div>
              
              {isFilterOpen && (
                <div className="flex flex-wrap items-center gap-6 mt-8 p-6 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 rounded-2xl">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{t('region')}</label>
                    <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                      <SelectTrigger className="w-[200px] bg-white border-slate-200">
                        <SelectValue placeholder={t('selectRegion')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('allRegions')}</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{t('sector')}</label>
                    <Select value={filters.sector} onValueChange={(value) => updateFilter('sector', value)}>
                      <SelectTrigger className="w-[200px] bg-white border-slate-200">
                        <SelectValue placeholder={t('selectSector')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('allSectors')}</SelectItem>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="ml-auto text-slate-600 hover:text-slate-900 self-end"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('clearFilters')}
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-0 px-6 pb-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'inactive' | 'deleted')} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100/80 via-blue-100/50 to-indigo-100/50 p-1 rounded-2xl mb-6">
                  <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold">
                    {t('active')}
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold">
                    {t('inactive')}
                  </TabsTrigger>
                  <TabsTrigger value="deleted" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold">
                    {t('deleted')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <SchoolsContainer
                    schools={processedSchools}
                    regions={regions}
                    sectors={sectors}
                    isLoading={isLoading}
                    error={schoolsError?.message || null}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalCount={processedSchools.length}
                    onPageChange={handlePageChange}
                    onSchoolUpdate={handleSchoolUpdate}
                    onSchoolDelete={handleSchoolDelete}
                    searchQuery={searchQuery}
                    filters={filters}
                    regionNames={regionNames}
                    sectorNames={sectorNames}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Schools;
