import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  School, 
  Calendar, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
}

interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any[];
  validation?: any;
}

interface School {
  id: string;
  name: string;
}

type Mode = 'category-selection' | 'data-entry';
type EntryType = 'sector' | 'single-school' | 'bulk-schools';

interface UnifiedSectorDataEntryProps {
  className?: string;
  onComplete?: () => void;
}

export const UnifiedSectorDataEntry: React.FC<UnifiedSectorDataEntryProps> = ({
  className,
  onComplete
}) => {
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  const queryClient = useQueryClient();
  
  // Main state
  const [mode, setMode] = useState<Mode>('category-selection');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [entryType, setEntryType] = useState<EntryType>('sector');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Get user's sector ID
  const [userSectorId, setUserSectorId] = useState<string>('');
  
  useEffect(() => {
    const fetchUserSector = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('sector_id')
        .eq('user_id', user.id)
        .eq('role', 'sectoradmin')
        .single();
        
      if (data?.sector_id) {
        setUserSectorId(data.sector_id);
      }
    };
    
    fetchUserSector();
  }, [user]);

  // Fetch categories with smart filtering
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['sector-categories', userSectorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .in('assignment', ['all', 'sectors'])
        .order('name');
        
      if (error) throw error;
      
      // Return real data without mock completion rate
      return data as Category[];
    },
    enabled: !!userSectorId
  });

  // Fetch columns for selected category  
  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ['category-columns', selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('status', 'active')
        .order('order_index');
        
      if (error) throw error;
      return data as Column[];
    },
    enabled: !!selectedCategory
  });

  // Fetch schools for bulk mode
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['sector-schools', userSectorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('sector_id', userSectorId)
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      return data as School[];
    },
    enabled: !!userSectorId && entryType !== 'sector'
  });

  // Smart category selection handler
  const handleCategorySelect = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    if (!category) return;
    
    setSelectedCategory(categoryId);
    
    // Smart entry type detection
    if (category.assignment === 'sectors') {
      setEntryType('sector');
    } else {
      setEntryType('single-school'); // Default to single, can be changed by selection
    }
    
    // Move to data entry mode
    setMode('data-entry');
  };

  // Handle back to category selection
  const handleBack = () => {
    setMode('category-selection');
    setSelectedCategory('');
    setSelectedColumn('');
    setInputValue('');
    setSelectedSchools([]);
  };

  // Handle school mode toggle - automatic based on selection
  const updateEntryTypeBasedOnSelection = (schoolIds: string[]) => {
    if (schoolIds.length === 0) {
      setEntryType('single-school');
    } else if (schoolIds.length === 1) {
      setEntryType('single-school');
    } else {
      setEntryType('bulk-schools');
    }
  };

  // Update selected schools and auto-detect entry type
  const handleSchoolSelection = (schoolIds: string[]) => {
    setSelectedSchools(schoolIds);
    updateEntryTypeBasedOnSelection(schoolIds);
  };

  // Data submission mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategory || !selectedColumn || !user) {
        throw new Error('Missing required data');
      }

      if (entryType === 'sector') {
        // Sector direct entry
        const { error } = await supabase
          .from('sector_data_entries')
          .upsert({
            sector_id: userSectorId,
            category_id: selectedCategory,
            column_id: selectedColumn,
            value: inputValue,
            status: 'approved',
            created_by: user.id,
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      } else {
        // School entries (single or bulk)
        const schoolIds = entryType === 'single-school' ? selectedSchools.slice(0, 1) : selectedSchools;
        
        const entries = schoolIds.map(schoolId => ({
          school_id: schoolId,
          category_id: selectedCategory,
          column_id: selectedColumn,
          value: inputValue,
          status: 'pending',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('data_entries')
          .upsert(entries);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Məlumat uğurla yadda saxlandı",
        description: `${entryType === 'sector' ? 'Sektor' : selectedSchools.length + ' məktəb'} üçün məlumat yadda saxlandı.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['sector-categories'] });
      
      if (onComplete) {
        onComplete();
      } else {
        handleBack();
      }
    },
    onError: (error) => {
      toast({
        title: "Xəta baş verdi",
        description: error instanceof Error ? error.message : "Naməlum xəta",
        variant: "destructive"
      });
    }
  });

  // Get selected category details
  const selectedCategoryDetails = categories?.find(c => c.id === selectedCategory);
  const selectedColumnDetails = columns?.find(c => c.id === selectedColumn);

  // Validation
  const canSubmit = selectedCategory && selectedColumn && inputValue.trim() && 
    (entryType === 'sector' || selectedSchools.length > 0);

  // Render category selection
  if (mode === 'category-selection') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6" />
            Məlumat Daxil Etmə
          </h2>
          <p className="text-muted-foreground">
            Məlumat daxil etmək istədiyiniz kateqoriyanı seçin
          </p>
        </div>

        {categoriesLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {categories?.map((category) => (
              <Card 
                key={category.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Assignment badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant={category.assignment === 'sectors' ? 'default' : 'secondary'}
                      className={category.assignment === 'sectors' ? 'bg-blue-100 text-blue-800' : ''}
                    >
                      {category.assignment === 'sectors' ? (
                        <>
                          <Building2 className="h-3 w-3 mr-1" />
                          Sektor üçün
                        </>
                      ) : (
                        <>
                          <School className="h-3 w-3 mr-1" />
                          Məktəblər üçün
                        </>
                      )}
                    </Badge>
                    
                    {category.deadline && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(category.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render data entry mode
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with back button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {entryType === 'sector' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <School className="h-5 w-5" />
              )}
              {selectedCategoryDetails?.name}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Entry type indicator */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {entryType === 'sector' ? (
              <>
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-primary">Sektor Məlumatı</div>
                  <div className="text-sm text-muted-foreground">
                    Bu məlumat birbaşa sektor üçün qeyd ediləcək
                  </div>
                </div>
              </>
            ) : (
              <>
                <School className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium text-primary">Məktəb Məlumatları</div>
                  <div className="text-sm text-muted-foreground">
                    Aşağıdan məktəb(ləri) seçin və məlumat daxil edin
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Column selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sütun Seçimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {columnsLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sütun seçin..." />
              </SelectTrigger>
              <SelectContent>
                {columns?.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{column.name}</span>
                        {column.is_required && (
                          <Badge variant="destructive" className="text-xs">Məcburi</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Tip: {column.type}</span>
                        {column.help_text && (
                          <span className="truncate max-w-40">• {column.help_text}</span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {selectedColumnDetails && (
            <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {selectedColumnDetails.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedColumnDetails.type}
                    </Badge>
                    {selectedColumnDetails.is_required && (
                      <Badge variant="destructive" className="text-xs">
                        Məcburi sahə
                      </Badge>
                    )}
                  </div>
                  {selectedColumnDetails.help_text && (
                    <div className="text-xs text-muted-foreground">
                      {selectedColumnDetails.help_text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* School selection for non-sector modes */}
      {entryType !== 'sector' && selectedColumn && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Məktəb Seçimi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schoolsLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedSchools.length === 0 
                      ? 'Məktəb seçin (bir və ya bir neçəsini)' 
                      : selectedSchools.length === 1
                      ? '1 məktəb seçilib - tək məktəb üçün data entry'
                      : `${selectedSchools.length} məktəb seçilib - bulk data entry`
                    }
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSchoolSelection(schools?.map(s => s.id) || [])}
                    >
                      Hamısını seç
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSchoolSelection([])}
                    >
                      Təmizlə
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto border rounded-lg p-2">
                  {schools?.map((school) => (
                    <div key={school.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                      <Checkbox
                        checked={selectedSchools.includes(school.id)}
                        onCheckedChange={(checked) => {
                          let newSelection;
                          if (checked) {
                            newSelection = [...selectedSchools, school.id];
                          } else {
                            newSelection = selectedSchools.filter(id => id !== school.id);
                          }
                          handleSchoolSelection(newSelection);
                        }}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{school.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data input */}
      {selectedColumn && (entryType === 'sector' || selectedSchools.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Məlumat Daxil Etmə</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input field based on column type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedColumnDetails?.name}
                {selectedColumnDetails?.is_required && <span className="text-destructive ml-1">*</span>}
              </label>
              
              {selectedColumnDetails?.type === 'textarea' ? (
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedColumnDetails.placeholder || `${selectedColumnDetails.name} daxil edin...`}
                  rows={4}
                />
              ) : selectedColumnDetails?.type === 'select' && selectedColumnDetails.options ? (
                <Select value={inputValue} onValueChange={setInputValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedColumnDetails.options.map((option: any, index: number) => (
                      <SelectItem key={index} value={option.value || option}>
                        {option.label || option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={
                    selectedColumnDetails?.type === 'number' ? 'number' :
                    selectedColumnDetails?.type === 'date' ? 'date' :
                    selectedColumnDetails?.type === 'email' ? 'email' :
                    'text'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedColumnDetails?.placeholder || `${selectedColumnDetails?.name} daxil edin...`}
                />
              )}
              
              {selectedColumnDetails?.help_text && (
                <p className="text-xs text-muted-foreground">
                  {selectedColumnDetails.help_text}
                </p>
              )}
            </div>

            {/* Preview */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-primary">
                    Önizləmə
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entryType === 'sector' ? (
                      <>Sektor üçün <strong>"{selectedColumnDetails?.name}"</strong> sütununa <strong>"{inputValue || '[boş]'}"</strong> dəyəri daxil ediləcək.</>
                    ) : (
                      <>
                        <strong>{selectedSchools.length}</strong> məktəb üçün{' '}
                        <strong>"{selectedColumnDetails?.name}"</strong> sütununa{' '}
                        <strong>"{inputValue || '[boş]'}"</strong> dəyəri daxil ediləcək.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={!canSubmit || submitMutation.isPending}
                className="flex-1"
              >
                {submitMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Yadda saxlanılır...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Yadda saxla və göndər
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={submitMutation.isPending}
              >
                Ləğv et
              </Button>
            </div>

            {/* Success/Error messages */}
            {submitMutation.isError && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {submitMutation.error instanceof Error 
                    ? submitMutation.error.message 
                    : 'Naməlum xəta baş verdi'
                  }
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};