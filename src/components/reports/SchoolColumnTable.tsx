import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolColumnReport } from '@/hooks/useSchoolColumnReport';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye 
} from 'lucide-react';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

const getStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t('approved')}</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t('pending')}</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{t('rejected')}</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
  }
};

const FilterSection = ({ 
  showFilters, 
  setShowFilters, 
  searchQuery, 
  setSearchQuery,
  regionsData,
  sectorsData,
  regionId,
  setRegionId,
  sectorId,
  setSectorId,
  statusFilter,
  setStatusFilter,
  resetFilters,
  isSectorAdmin,
  t
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('filters')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
          >
            {t('resetFilters')}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!isSectorAdmin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('region')}</label>
                    <Select 
                      value={regionId || ''} 
                      onValueChange={(value) => setRegionId(value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectRegion')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('allRegions')}</SelectItem>
                        {regionsData.map(region => (
                          <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('sector')}</label>
                    <Select 
                      value={sectorId || ''} 
                      onValueChange={(value) => setSectorId(value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectSector')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('allSectors')}</SelectItem>
                        {sectorsData.map(sector => (
                          <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('status')}</label>
                <Select 
                  value={statusFilter} 
                  onValueChange={(value: any) => setStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatuses')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="approved">{t('approved')}</SelectItem>
                    <SelectItem value="rejected">{t('rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchSchool')}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

const SchoolTable = ({
  loading,
  error,
  filteredData,
  data,
  selectAll,
  setSelectAll,
  selectedSchools,
  setSelectedSchools,
  isSectorAdmin,
  toggleSchoolSelection,
  setSelectedSchoolData,
  setIsDetailDialogOpen,
  setFeedbackText,
  approveData,
  rejectData,
  t
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectAll}
                onCheckedChange={(checked) => {
                  setSelectAll(!!checked);
                  if (checked) {
                    setSelectedSchools(filteredData.map(school => school.schoolId));
                  } else {
                    setSelectedSchools([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>{t('schoolName')}</TableHead>
            {!isSectorAdmin && (
              <>
                <TableHead>{t('region')}</TableHead>
                <TableHead>{t('sector')}</TableHead>
              </>
            )}
            
            {filteredData.length > 0 && filteredData[0].columnData.map((column, index) => (
              <TableHead key={index}>{column.name || `${t('column')} ${index + 1}`}</TableHead>
            ))}
            
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                {!isSectorAdmin && (
                  <>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </>
                )}
                {/* Dinamik sütunlar üçün skeleton */}
                {Array.from({ length: data[0]?.columnData?.length || 3 }).map((_, colIndex) => (
                  <TableCell key={colIndex}><Skeleton className="h-4 w-20" /></TableCell>
                ))}
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell 
                colSpan={isSectorAdmin ? 4 + (data[0]?.columnData?.length || 0) : 6 + (data[0]?.columnData?.length || 0)} 
                className="text-center py-8 text-muted-foreground"
              >
                {error}
              </TableCell>
            </TableRow>
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={isSectorAdmin ? 4 + (data[0]?.columnData?.length || 0) : 6 + (data[0]?.columnData?.length || 0)} 
                className="text-center py-8 text-muted-foreground"
              >
                {t('noDataAvailable')}
                <p className="mt-2 text-sm">{t('selectAnotherCategory')}</p>
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((school) => (
              <TableRow key={school.schoolId}>
                <TableCell>
                  <Checkbox 
                    checked={selectedSchools.includes(school.schoolId)}
                    onCheckedChange={() => toggleSchoolSelection(school.schoolId)}
                  />
                </TableCell>
                <TableCell className="font-medium">{school.schoolName}</TableCell>
                
                {/* Region və sektor sütunlarını yalnız sektoradmin olmayan istifadəçilər üçün göstəririk */}
                {!isSectorAdmin && (
                  <>
                    <TableCell>{school.region}</TableCell>
                    <TableCell>{school.sector}</TableCell>
                  </>
                )}
                
                {school.columnData.map((col, index) => (
                  <TableCell key={index}>{col.value || "-"}</TableCell>
                ))}
                
                <TableCell>{getStatusBadge(school.status, t)}</TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedSchoolData(school);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t('view')}
                    </Button>
                    
                    {school.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            approveData(school.schoolId);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('approve')}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedSchoolData(school);
                            setFeedbackText('');
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('reject')}
                        </Button>
                      </>
                    )}
                    
                    {school.status === 'rejected' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSchoolData(school);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('edit')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const SchoolDetailDialog = ({
  isOpen,
  onOpenChange,
  selectedSchoolData,
  isSectorAdmin,
  feedbackText,
  setFeedbackText,
  approveData,
  rejectData,
  t
}) => {
  if (!selectedSchoolData) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedSchoolData.schoolName}</span>
            {getStatusBadge(selectedSchoolData.status, t)}
          </DialogTitle>
          <DialogDescription>
            {!isSectorAdmin && (
              <div className="mt-2 text-sm">
                <span className="font-medium">{t('region')}:</span> {selectedSchoolData.region} | 
                <span className="font-medium ml-2">{t('sector')}:</span> {selectedSchoolData.sector}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {selectedSchoolData.columnData && selectedSchoolData.columnData.map((column, index) => (
            <div key={index} className="space-y-1">
              <label className="text-sm font-medium">{column.name || `${t('column')} ${index + 1}`}</label>
              <div className="p-2 border rounded-md bg-muted/50">
                {column.value || "-"}
              </div>
            </div>
          ))}
        </div>
        
        {selectedSchoolData.feedback && (
          <div className="space-y-1 mt-2">
            <label className="text-sm font-medium">{t('previousFeedback')}</label>
            <div className="p-2 border rounded-md bg-muted/50">
              {selectedSchoolData.feedback}
            </div>
          </div>
        )}
        
        {selectedSchoolData.status === 'pending' && (
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">{t('feedback')}</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={t('enterFeedback')}
            />
          </div>
        )}
        
        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('close')}
          </Button>
          
          {selectedSchoolData.status === 'pending' && (
            <>
              <Button
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => {
                  approveData(selectedSchoolData.schoolId, feedbackText);
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('approve')}
              </Button>
              
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (!feedbackText.trim()) {
                    toast.error(t('feedbackRequired'));
                    return;
                  }
                  rejectData(selectedSchoolData.schoolId, feedbackText);
                  onOpenChange(false);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('reject')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SchoolColumnTable: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isSectorAdmin } = usePermissions();
  
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
    exportToExcel,
    approveData,
    rejectData
  } = useSchoolColumnReport();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSchoolData, setSelectedSchoolData] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  const regionsQuery = useCachedQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await supabase.from('regions').select('*');
      return data || [];
    }
  });
  
  const sectorsQuery = useCachedQuery({
    queryKey: ['sectors', regionId],
    queryFn: async () => {
      let query = supabase.from('sectors').select('*');
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: true
  });
  
  const categoriesQuery = useCachedQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    }
  });
  
  const regionsData = (regionsQuery.data || []) as any[];
  const sectorsData = (sectorsQuery.data || []) as any[];
  const categoriesData = (categoriesQuery.data || []) as any[];
  
  const filteredData = data.filter(school => 
    school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleSchoolSelection = useCallback((schoolId: string) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        return [...prev, schoolId];
      }
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    setRegionId(undefined);
    setSectorId(undefined);
    setStatusFilter('all');
    setSearchQuery('');
  }, [setRegionId, setSectorId, setStatusFilter]);
  
  useEffect(() => {
    if (regionId) {
      setSectorId(undefined);
    }
  }, [regionId, setSectorId]);
  
  useEffect(() => {
    loadData();
  }, [loadData, categoryId, regionId, sectorId, statusFilter]);
  
  useEffect(() => {
    if (filteredData.length > 0 && selectedSchools.length === filteredData.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedSchools.length, filteredData.length]);
  
  return (
    <div className="space-y-4">
      <FilterSection 
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        regionsData={regionsData}
        sectorsData={sectorsData}
        regionId={regionId}
        setRegionId={setRegionId}
        sectorId={sectorId}
        setSectorId={setSectorId}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resetFilters={resetFilters}
        isSectorAdmin={isSectorAdmin}
        t={t}
      />
      
      <SchoolTable 
        loading={loading}
        error={error}
        filteredData={filteredData}
        data={data}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        selectedSchools={selectedSchools}
        setSelectedSchools={setSelectedSchools}
        isSectorAdmin={isSectorAdmin}
        toggleSchoolSelection={toggleSchoolSelection}
        setSelectedSchoolData={setSelectedSchoolData}
        setIsDetailDialogOpen={setIsDetailDialogOpen}
        setFeedbackText={setFeedbackText}
        approveData={approveData}
        rejectData={rejectData}
        t={t}
      />
      
      <SchoolDetailDialog 
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        selectedSchoolData={selectedSchoolData}
        isSectorAdmin={isSectorAdmin}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
        approveData={approveData}
        rejectData={rejectData}
        t={t}
      />
    </div>
  );
};

export default SchoolColumnTable;
