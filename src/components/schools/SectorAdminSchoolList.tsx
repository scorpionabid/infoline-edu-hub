import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  School, 
  Search, 
  Building2, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { useSchoolCategories } from '@/hooks/categories/useCategoriesWithAssignment';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SectorAdminProxyDataEntry } from '@/components/dataEntry/SectorAdminProxyDataEntry';
import { BulkDataEntryDialog } from '@/components/dataEntry/BulkDataEntryDialog';
import { cn } from '@/lib/utils';

interface SectorAdminSchoolListProps {
  onSchoolSelect?: (schoolId: string) => void;
  onDataEntry?: (schoolId: string) => void;
  onBulkSelect?: (schoolIds: string[]) => void;
}

const ITEMS_PER_PAGE = 12;

export const SectorAdminSchoolList: React.FC<SectorAdminSchoolListProps> = ({
  onSchoolSelect,
  onDataEntry,
  onBulkSelect
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showDataEntry, setShowDataEntry] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'completion'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  
  // Data fetching
  const { schools, loading: schoolsLoading } = useSchoolsQuery();
  const { data: categories, isLoading: categoriesLoading } = useSchoolCategories();

  // Memoized filtered and sorted schools
  const processedSchools = useMemo(() => {
    let filtered = schools.filter(school => 
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = a.completion_rate || 0;
        bValue = b.completion_rate || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [schools, searchQuery, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(processedSchools.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSchools = processedSchools.slice(startIndex, endIndex);

  // Selection management
  const isAllCurrentPageSelected = currentSchools.length > 0 && 
    currentSchools.every(school => selectedSchools.has(school.id));
  const isSomeCurrentPageSelected = currentSchools.some(school => selectedSchools.has(school.id));

  // Event handlers
  const handleSchoolSelect = (schoolId: string) => {
    console.log('School selected:', schoolId);
    setSelectedSchoolId(schoolId);
    if (onSchoolSelect) {
      onSchoolSelect(schoolId);
    }
  };

  const handleDataEntryClick = (schoolId: string) => {
    console.log('Data entry button clicked for school:', schoolId);
    
    if (!selectedCategoryId) {
      alert('Zəhmət olmasa kateqoriya seçin');
      return;
    }
    
    setSelectedSchoolId(schoolId);
    setShowDataEntry(true);
    
    if (onDataEntry) {
      onDataEntry(schoolId);
    }
  };

  const handleCloseDataEntry = () => {
    console.log('Closing data entry');
    setShowDataEntry(false);
    setSelectedSchoolId(null);
  };

  const handleBulkDataEntry = () => {
    if (selectedSchools.size === 0) {
      alert('Zəhmət olmasa ən azı bir məktəb seçin');
      return;
    }
    
    if (!selectedCategoryId) {
      alert('Zəhmət olmasa kateqoriya seçin');
      return;
    }
    
    setShowBulkDialog(true);
  };

  const handleBulkDialogComplete = () => {
    // Clear selection and refresh data
    setSelectedSchools(new Set());
    setShowBulkDialog(false);
    
    if (onBulkSelect) {
      onBulkSelect([]);
    }
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId);
      } else {
        newSet.add(schoolId);
      }
      
      if (onBulkSelect) {
        onBulkSelect(Array.from(newSet));
      }
      
      return newSet;
    });
  };

  const toggleAllCurrentPage = () => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      
      if (isAllCurrentPageSelected) {
        // Deselect all on current page
        currentSchools.forEach(school => newSet.delete(school.id));
      } else {
        // Select all on current page
        currentSchools.forEach(school => newSet.add(school.id));
      }
      
      if (onBulkSelect) {
        onBulkSelect(Array.from(newSet));
      }
      
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedSchools(new Set());
    if (onBulkSelect) {
      onBulkSelect([]);
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Loading state
  if (schoolsLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  // Show data entry form if a school is selected for data entry
  if (showDataEntry && selectedSchoolId && selectedCategoryId) {
    return (
      <div className="h-full">
        <SectorAdminProxyDataEntry
          schoolId={selectedSchoolId}
          categoryId={selectedCategoryId}
          onClose={handleCloseDataEntry}
          onComplete={() => {
            console.log('Proxy data entry completed');
            handleCloseDataEntry();
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Məktəb Seçimi və Məlumat Daxil Etmə
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{processedSchools.length} məktəb</span>
              <span>•</span>
              <span>Səhifə {currentPage}/{totalPages}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Məktəb axtarın..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            
            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: 'name' | 'completion') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Ada görə</SelectItem>
                <SelectItem value="completion">Tamamlanma faiziə görə</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sıra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Artan</SelectItem>
                <SelectItem value="desc">Azalan</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Category Selection */}
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Selection Controls */}
          {selectedSchools.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedSchools.size} məktəb seçildi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkDataEntry}
                  disabled={!selectedCategoryId}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  Toplu Məlumat Daxil Et
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSelection}
                >
                  Seçimi Ləğv Et
                </Button>
              </div>
            </div>
          )}
          
          {/* Warning for category selection */}
          {!selectedCategoryId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Məlumat daxil etmək üçün kateqoriya seçin
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Bulk Selection Header */}
          {currentSchools.length > 0 && (
            <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
              <Checkbox
                checked={isAllCurrentPageSelected}
                onCheckedChange={toggleAllCurrentPage}
                {...(isSomeCurrentPageSelected && !isAllCurrentPageSelected ? { indeterminate: true } : {})}
              />
              <span className="text-sm text-muted-foreground">
                Bu səhifədəki hamısını seç
              </span>
            </div>
          )}
          
          {/* Schools List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {currentSchools.map((school) => (
                <Card 
                  key={school.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedSchools.has(school.id) && "ring-2 ring-primary/50 bg-primary/5",
                    selectedSchoolId === school.id && "border-primary shadow-md"
                  )}
                  onClick={() => handleSchoolSelect(school.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      <Checkbox
                        checked={selectedSchools.has(school.id)}
                        onCheckedChange={() => toggleSchoolSelection(school.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      
                      {/* School Icon */}
                      <School className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      
                      {/* School Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {school.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          ID: {school.id.slice(0, 8)}...
                        </p>
                        
                        {/* Completion Badge */}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {school.completion_rate || 0}% tamamlandı
                          </Badge>
                          
                          {/* Action Button */}
                          {selectedSchoolId === school.id && (
                            <Button 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDataEntryClick(school.id);
                              }}
                              disabled={!selectedCategoryId}
                              variant={!selectedCategoryId ? 'secondary' : 'default'}
                              className="text-xs h-6"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Daxil Et
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Empty State */}
            {currentSchools.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Axtarış nəticəsində məktəb tapılmadı' : 'Heç bir məktəb tapılmadı'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                      className="mt-2"
                    >
                      Axtarışı Ləğv Et
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, processedSchools.length)} / {processedSchools.length} məktəb
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Data Entry Dialog */}
      <BulkDataEntryDialog
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        selectedSchools={Array.from(selectedSchools)}
        categoryId={selectedCategoryId}
        onComplete={handleBulkDialogComplete}
      />
    </div>
  );
};

export default SectorAdminSchoolList;
