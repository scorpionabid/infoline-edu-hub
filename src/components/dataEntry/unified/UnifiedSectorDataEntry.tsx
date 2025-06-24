import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Database,
  Building2,
  CheckCircle,
  Loader2,
  FileText,
  Grid3X3,
  BookOpen,
  Save,
  School,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSectorCategories } from '@/hooks/dataEntry/sector';
import { useSchoolDataForColumn } from '@/hooks/dataEntry/sector/useSchoolDataForColumn';
import { saveSingleSectorDataEntry } from '@/services/api/sectorDataEntry';
import { saveSchoolDataEntry } from '@/services/api/schoolDataEntry';
import { useAuthStore, selectUser, selectSectorId } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  completion_rate?: number;
}

interface SchoolDataEntry {
  schoolId: string;
  schoolName: string;
  sectorName: string;
  regionName: string;
  currentValue?: string;
  status: 'pending' | 'approved' | 'rejected' | 'empty';
  lastUpdated?: string;
  submittedBy?: string;
}

type WorkflowStep = 'category' | 'column' | 'data-entry';
type EntryMode = 'sector' | 'school' | null;

const UnifiedSectorDataEntry: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const sectorId = useAuthStore(selectSectorId);
  
  // State management
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('category');
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [schoolEntries, setSchoolEntries] = useState<{[key: string]: string}>({});
  const [sectorValue, setSectorValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching
  const { 
    categories, 
    columns, 
    isLoadingCategories, 
    isLoadingColumns,
    loadColumns 
  } = useSectorCategories();

  const {
    schoolData,
    isLoadingSchoolData,
    loadSchoolData
  } = useSchoolDataForColumn();

  // Auto-determine mode based on category selection
  useEffect(() => {
    if (selectedCategory) {
      const mode = selectedCategory.assignment === 'sectors' ? 'sector' : 'school';
      setEntryMode(mode);
    }
  }, [selectedCategory]);

  // Load columns when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadColumns(selectedCategory.id);
    }
  }, [selectedCategory, loadColumns]);

  // Load school data when column is selected and mode is school
  useEffect(() => {
    if (selectedColumn && entryMode === 'school' && sectorId) {
      loadSchoolData(selectedColumn.id, sectorId);
    }
  }, [selectedColumn, entryMode, sectorId, loadSchoolData]);

  // Step navigation
  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step);
  };

  // Category selection handler
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedColumn(null);
    setSchoolEntries({});
    setSectorValue('');
    goToStep('column');
  };

  // Column selection handler
  const handleColumnSelect = (column: Column) => {
    setSelectedColumn(column);
    setSchoolEntries({});
    setSectorValue('');
    goToStep('data-entry');
  };

  // Handle school data entry change
  const handleSchoolValueChange = (schoolId: string, value: string) => {
    setSchoolEntries(prev => ({
      ...prev,
      [schoolId]: value
    }));
  };

  // Save individual school entry
  const handleSaveSchoolEntry = async (schoolId: string) => {
    if (!selectedCategory || !selectedColumn || !user) {
      toast.error('Məlumatlar natamam');
      return;
    }

    const value = schoolEntries[schoolId];
    if (!value && selectedColumn.is_required) {
      toast.error('Bu sahə məcburidir');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveSchoolDataEntry({
        schoolId,
        categoryId: selectedCategory.id,
        columnId: selectedColumn.id,
        value: value || '',
        userId: user.id
      });
      
      toast.success('Məktəb məlumatı saxlanıldı');
      
      // Refresh school data
      if (sectorId) {
        loadSchoolData(selectedColumn.id, sectorId);
      }
      
    } catch (error: any) {
      console.error('School data save error:', error);
      toast.error('Məlumat saxlanarkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save sector entry
  const handleSaveSectorEntry = async () => {
    if (!selectedCategory || !selectedColumn || !user || !sectorId) {
      toast.error('Məlumatlar natamam');
      return;
    }

    if (!sectorValue && selectedColumn.is_required) {
      toast.error('Bu sahə məcburidir');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveSingleSectorDataEntry(
        sectorId,
        selectedCategory.id,
        selectedColumn.id,
        sectorValue,
        user.id
      );
      
      toast.success('Sektor məlumatı uğurla saxlanıldı');
      setSectorValue('');
      
    } catch (error: any) {
      console.error('Sector data save error:', error);
      toast.error('Məlumat saxlanarkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk save for schools
  const handleBulkSave = async () => {
    if (!selectedCategory || !selectedColumn || !user) {
      toast.error('Məlumatlar natamam');
      return;
    }

    const entries = Object.entries(schoolEntries).filter(([_, value]) => value?.trim());
    
    if (entries.length === 0) {
      toast.error('Heç bir məlumat daxil edilməyib');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    
    try {
      for (const [schoolId, value] of entries) {
        try {
          await saveSchoolDataEntry({
            schoolId,
            categoryId: selectedCategory.id,
            columnId: selectedColumn.id,
            value,
            userId: user.id
          });
          successCount++;
        } catch (error) {
          console.error(`Error saving for school ${schoolId}:`, error);
        }
      }
      
      toast.success(`${successCount} məktəb məlumatı saxlanıldı`);
      
      // Clear entries
      setSchoolEntries({});
      
      // Refresh school data
      if (sectorId) {
        loadSchoolData(selectedColumn.id, sectorId);
      }
      
    } catch (error: any) {
      console.error('Bulk save error:', error);
      toast.error('Məlumatlar saxlanarkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep('category');
    setEntryMode(null);
    setSelectedCategory(null);
    setSelectedColumn(null);
    setSchoolEntries({});
    setSectorValue('');
  };

  // Progress calculation
  const getProgress = () => {
    const stepOrder: WorkflowStep[] = ['category', 'column', 'data-entry'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return ((currentIndex + 1) / stepOrder.length) * 100;
  };

  // Render input field based on column type
  const renderInputField = (value: string, onChange: (value: string) => void, disabled = false) => {
    if (selectedColumn?.type === 'textarea') {
      return (
        <Textarea
          placeholder={selectedColumn.placeholder || 'Məlumatı daxil edin...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      );
    } else if (selectedColumn?.type === 'select' && selectedColumn.options) {
      return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Seçim edin..." />
          </SelectTrigger>
          <SelectContent>
            {selectedColumn.options.map((option: any) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          type={selectedColumn?.type === 'number' ? 'number' : 'text'}
          placeholder={selectedColumn?.placeholder || 'Məlumatı daxil edin...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
    }
  };

  // Render category selection
  const renderCategorySelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Məlumat Daxil Etmə</h2>
        <p className="text-muted-foreground">
          Məlumat daxil etmək istədiyiniz kateqoriyanı seçin
        </p>
      </div>

      {isLoadingCategories ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Kateqoriyalar yüklənir...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCategorySelect(category)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.assignment === 'sectors' ? (
                      <Database className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-green-600" />
                    )}
                    {category.name}
                  </CardTitle>
                  <Badge 
                    variant={category.assignment === 'sectors' ? 'default' : 'secondary'}
                  >
                    {category.assignment === 'sectors' ? 'Sektor üçün' : 'Məktəblər üçün'}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </CardHeader>
              {category.completion_rate !== undefined && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tamamlanma</span>
                      <span className="font-medium">{category.completion_rate}%</span>
                    </div>
                    <Progress value={category.completion_rate} className="h-2" />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render column selection
  const renderColumnSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => goToStep('category')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Sütun Seçimi</h2>
          <p className="text-muted-foreground">
            {selectedCategory?.name} kateqoriyası üçün sütun seçin
          </p>
        </div>
      </div>

      {/* Category info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {entryMode === 'sector' ? (
                <Database className="h-5 w-5 text-blue-600" />
              ) : (
                <Building2 className="h-5 w-5 text-green-600" />
              )}
              <div>
                <div className="font-medium">{selectedCategory?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {entryMode === 'sector' ? 'Sektor Məlumatı' : 'Məktəb Məlumatları'}
                </div>
              </div>
            </div>
            <Badge variant={entryMode === 'sector' ? 'default' : 'secondary'}>
              {entryMode === 'sector' 
                ? 'Bu məlumat birbaşa sektor üçün qeyd ediləcək'
                : 'Bu məlumat məktəblər üçün daxil ediləcək'
              }
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isLoadingColumns ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Sütunlar yüklənir...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {columns.map((column) => (
            <Card 
              key={column.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleColumnSelect(column)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Grid3X3 className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="font-medium">{column.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Tip: {column.type} • {column.is_required ? 'Məcburi' : 'İxtiyari'}
                      </div>
                    </div>
                  </div>
                  {column.is_required && (
                    <Badge variant="destructive" className="text-xs">
                      Məcburi
                    </Badge>
                  )}
                </div>
                {column.help_text && (
                  <div className="mt-2 text-sm text-blue-600">
                    💡 {column.help_text}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render data entry interface
  const renderDataEntry = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => goToStep('column')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Məlumat Daxil Etmə</h2>
          <p className="text-muted-foreground">
            {selectedColumn?.name} sütunu üçün məlumat daxil edin
          </p>
        </div>
      </div>

      {/* Selected info */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kateqoriya:</span>
              <span className="text-sm">{selectedCategory?.name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sütun:</span>
              <span className="text-sm">{selectedColumn?.name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rejim:</span>
              <Badge variant={entryMode === 'sector' ? 'default' : 'secondary'}>
                {entryMode === 'sector' ? 'Sektor Məlumatı' : 'Məktəb Məlumatları'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Interface */}
      {entryMode === 'sector' ? (
        // Sector data entry
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sektor Məlumatı Daxil Edin</CardTitle>
            {selectedColumn?.help_text && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedColumn.help_text}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {renderInputField(sectorValue, setSectorValue, isSubmitting)}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => goToStep('column')}>
                Ləğv et
              </Button>
              <Button 
                onClick={handleSaveSectorEntry}
                disabled={isSubmitting || (selectedColumn?.is_required && !sectorValue.trim())}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saxlanır...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sektor Məlumatını Saxla
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // School data entry table
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Məktəb Məlumatları
              </span>
              {Object.keys(schoolEntries).length > 0 && (
                <Button 
                  onClick={handleBulkSave}
                  disabled={isSubmitting}
                  className="ml-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saxlanır...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Hamısını Saxla ({Object.keys(schoolEntries).length})
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSchoolData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Məktəb məlumatları yüklənir...</span>
              </div>
            ) : schoolData.length === 0 ? (
              <div className="text-center py-8">
                <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Məktəb tapılmadı</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Bu sektor üçün heç bir məktəb tapılmadı
                </p>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  Debug məlumatı: Console-da daha ətraflı məlumat yoxlayın
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Məktəb</TableHead>
                      <TableHead>Mövcud Dəyər</TableHead>
                      <TableHead>Yeni Dəyər</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Əməliyyat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolData.map((school) => (
                      <TableRow key={school.schoolId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{school.schoolName}</div>
                            <div className="text-sm text-muted-foreground">
                              {school.sectorName}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {school.currentValue ? (
                            <span className="font-medium">{school.currentValue}</span>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Boş
                            </Badge>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-xs">
                            {renderInputField(
                              schoolEntries[school.schoolId] || '',
                              (value) => handleSchoolValueChange(school.schoolId, value),
                              isSubmitting
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant={
                              school.status === 'approved' ? 'default' :
                              school.status === 'pending' ? 'secondary' :
                              school.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {school.status === 'approved' ? 'Təsdiqlənmiş' :
                             school.status === 'pending' ? 'Gözləyən' :
                             school.status === 'rejected' ? 'Rədd edilmiş' : 'Boş'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleSaveSchoolEntry(school.schoolId)}
                            disabled={
                              isSubmitting || 
                              !schoolEntries[school.schoolId] ||
                              (selectedColumn?.is_required && !schoolEntries[school.schoolId]?.trim())
                            }
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Saxla
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sektor Məlumat Girişi</h1>
              <p className="text-slate-600">
                Sektor və məktəb məlumatlarını daxil edin
              </p>
            </div>
            <div className="ml-auto">
              <Button variant="outline" onClick={resetWorkflow}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Əvvələ qayıt
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Gedişat</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {currentStep === 'category' && renderCategorySelection()}
          {currentStep === 'column' && renderColumnSelection()}
          {currentStep === 'data-entry' && renderDataEntry()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedSectorDataEntry;