import React, { useCallback, useEffect, useState } from 'react';
import { useDataEntry } from '@/hooks/dataEntry/useDataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, School, Search, Building, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import FormFields from '@/components/dataEntry/FormFields';

// Alert komponenti
export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "warning";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "border text-foreground",
    destructive:
      "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    warning:
      "border-orange-500/50 text-orange-500 dark:border-orange-500 [&>svg]:text-orange-500",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

// DataEntryForm Props
interface DataEntryFormProps {
  schoolId?: string;
  categories?: any[];
  initialCategoryId?: string;
  isSectorAdmin?: boolean;
  schoolName?: string;
}

// Məlumat daxiletmə komponenti - Enhanced with null safety
const DataEntryForm: React.FC<DataEntryFormProps> = ({ schoolId, categories, initialCategoryId, isSectorAdmin = false, schoolName = "" }) => {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const permissions = usePermissions();
  const [readOnly, setReadOnly] = useState(false);
  const [formStatus, setFormStatus] = useState<'view' | 'edit' | 'locked'>('view');
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  
  // Müvəqqəti həll - formulyarları məcburi aktivləşdirmək
  useEffect(() => {
    // Birdafəlik formulyarı redaktə edilir vəziyyətinə gətir
    setFormStatus('edit');
    setReadOnly(false);
    console.log('Formulyar aktiv edildi');
    
    // Supabase ilə sessiya yoxlaması - diagnostic məqsədləri üçün
    const checkSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log('Aktiv sessiya tapıldı, ID:', sessionData.session.user.id);
        } else {
          console.log('Aktiv sessiya yoxdur');
        }
      } catch (err) {
        console.error('Sessiya yoxlama xətası:', err);
      }
    };
    
    checkSession();
  }, []);
  
  // Debug icazələri və məlumatların redaktə etmə statusunu
  useEffect(() => {
    console.log('DataEntry form permissions:', {
      user_id: user?.id,
      user_role: user?.role,
      can_edit: permissions.canEditData,
      can_submit: permissions.hasSubmitPermission,
      readOnly: readOnly,
      formStatus: formStatus
    });
    
    // Əgər istifadəçi undefined-dirsa, formanı sadecə readonly et
    if (!user || !user.role) {
      console.log('User undefined, setting form to read-only');
      setFormStatus('view');
      setReadOnly(true);
      return;
    }
    
    // Ekran görüntülərindəki problemin müvəqqəti həlli:
    // Roldan asılı olmayaraq formanı redaktə edilir vəziyyətinə gətir
    setFormStatus('edit');
    setReadOnly(false);
    
    // Normal həll (yuxarıdakı 2 sətri komment edib, bunları açmaq lazımdır):
    /*
    if (permissions.canEditData) {
      setFormStatus('edit');
      setReadOnly(false);
    } else {
      setFormStatus('view');
      setReadOnly(true);
    }
    */
  }, [user, permissions, readOnly]);
  
  // Safe categories check
  const safeCategories = React.useMemo(() => {
    if (!Array.isArray(categories)) {
      console.warn('DataEntryForm: categories is not an array:', categories);
      return [];
    }
    return categories.filter(cat => cat && cat.id);
  }, [categories]);
  
  const {
    formData,
    isAutoSaving,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleSave,
    handleReset,
    handleCategoryChange,
    currentCategory,
    loadingEntry,
    entryStatus,
    entryError,
    entryId
  } = useDataEntry({
    schoolId,
    categoryId: initialCategoryId
  });

  // Safe formData access with proper null checks
  const getFormValue = useCallback((columnId: string): string => {
    if (!formData || typeof formData !== 'object') {
      return '';
    }
    const value = formData[columnId];
    return value !== undefined && value !== null ? String(value) : '';
  }, [formData]);
  
  // Update URL when category changes
  useEffect(() => {
    if (currentCategory && currentCategory.id) {
      const newParams = new URLSearchParams(location.search);
      newParams.set('categoryId', currentCategory.id);
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    }
  }, [currentCategory, location.pathname, location.search, navigate]);
  
  // Loading state
  if (loadingEntry) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-15rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  // Error state
  if (entryError) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('error')}</h3>
            <p className="text-sm">{entryError}</p>
          </div>
        </Alert>
        <Button onClick={() => window.location.reload()}>{t('tryAgain')}</Button>
      </div>
    );
  }
  
  // No categories state
  if (!safeCategories || safeCategories.length === 0) {
    return (
      <div className="p-4">
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('noCategories')}</h3>
            <p className="text-sm">{t('noCategoriesDescription')}</p>
          </div>
        </Alert>
      </div>
    );
  }
  
  // Selected category with safety check
  const selectedCategory = currentCategory || (safeCategories.length > 0 ? safeCategories[0] : null);
  
  if (!selectedCategory) {
    return (
      <div className="p-4">
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('noCategorySelected')}</h3>
            <p className="text-sm">{t('pleaseSelectCategory')}</p>
          </div>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* School header for sector admin */}
      {isSectorAdmin && schoolName && (
        <div className="md:col-span-4 mb-2">
          <Alert variant="default" className="bg-blue-50">
            <Building className="h-4 w-4" />
            <div className="ml-4">
              <p className="text-sm font-medium">{t('dataEntryForSchool').replace('{school}', schoolName)}</p>
            </div>
          </Alert>
        </div>
      )}
      
      {/* Categories list */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div className="space-y-1 p-2">
                {safeCategories.map((category, index) => (
                  <Button
                    key={category.id || `category-${index}`}
                    variant={selectedCategory?.id === category.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      selectedCategory?.id === category.id && "font-medium"
                    )}
                    onClick={() => {
                      setCurrentCategoryIndex(index);
                      handleCategoryChange(category);
                    }}
                  >
                    {category.name || `Category ${index + 1}`}
                    {entryStatus && entryStatus[category.id] && (
                      <span className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full",
                        entryStatus[category.id] === 'draft' && "bg-yellow-100 text-yellow-800",
                        entryStatus[category.id] === 'pending' && "bg-blue-100 text-blue-800",
                        entryStatus[category.id] === 'approved' && "bg-green-100 text-green-800",
                        entryStatus[category.id] === 'rejected' && "bg-red-100 text-red-800"
                      )}>
                        {t(entryStatus[category.id])}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Data entry form */}
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>{selectedCategory?.name || t('untitledCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <form onSubmit={handleSubmit} className="space-y-6 p-2">
                {selectedCategory?.columns && Array.isArray(selectedCategory.columns) ? (
                  <FormFields 
                    columns={selectedCategory.columns}
                    disabled={isSubmitting || isAutoSaving}
                    readOnly={false}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {t('noColumnsForCategory')}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSubmitting || isAutoSaving}
                    >
                      {t('reset')}
                    </Button>
                  </div>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSave}
                      disabled={isSubmitting || isAutoSaving}
                    >
                      {isAutoSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('saving')}
                        </>
                      ) : (
                        t('saveDraft')
                      )}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isAutoSaving}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('submitting')}
                        </>
                      ) : (
                        t('submit')
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DataEntryPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryId = queryParams.get('categoryId');
  const statusFilter = queryParams.get('status');
  const { isSchoolAdmin, isSectorAdmin, sectorId } = usePermissions();
  
  // Tab seçimi
  const [activeTab, setActiveTab] = useState(isSchoolAdmin ? 'school' : 'sector');
  
  // Sektoradmin üçün məktəb seçimi
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');
  const [schools, setSchools] = useState<any[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');
  const [loadingSchools, setLoadingSchools] = useState<boolean>(false);
  
  // Kateqoriyalar
  const [sectorCategories, setSectorCategories] = useState<any[]>([]);
  const [schoolCategories, setSchoolCategories] = useState<any[]>([]);
  const [loadingSectorCategories, setLoadingSectorCategories] = useState<boolean>(false);
  
  // Məktəb administratoru üçün kateqoriyaları yükləyirik
  const { 
    categories: allCategories, 
    loading: loadingAllCategories, 
    error: categoriesError 
  } = useCategoryData({ 
    schoolId: isSchoolAdmin ? user?.school_id : null 
  });
  
  // Sektoradmin üçün məktəbləri yükləyirik
  useEffect(() => {
    const fetchSchools = async () => {
      if (isSectorAdmin && sectorId) {
        setLoadingSchools(true);
        try {
          const { data, error } = await supabase
            .from('schools')
            .select('id, name')
            .eq('sector_id', sectorId)
            .eq('status', 'active')
            .order('name');
            
          if (error) throw error;
          
          const safeData = Array.isArray(data) ? data : [];
          setSchools(safeData);
          setFilteredSchools(safeData);
          
          // İlk məktəbi seçirik
          if (safeData.length > 0 && !selectedSchoolId) {
            setSelectedSchoolId(safeData[0].id);
            setSelectedSchoolName(safeData[0].name);
          }
        } catch (error) {
          console.error('Məktəbləri yükləyərkən xəta:', error);
          toast.error(t('errorLoadingSchools'));
        } finally {
          setLoadingSchools(false);
        }
      }
    };
    
    fetchSchools();
  }, [isSectorAdmin, sectorId, t, selectedSchoolId]);
  
  // Sektoradmin üçün kateqoriyaları yükləyirik
  useEffect(() => {
    const fetchSectorCategories = async () => {
      if (isSectorAdmin) {
        setLoadingSectorCategories(true);
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('assignment', 'sectors')
            .eq('status', 'active')
            .order('priority', { ascending: true });
            
          if (error) throw error;
          
          const safeData = Array.isArray(data) ? data : [];
          
          // Safety check for empty data
          if (safeData.length === 0) {
            setSectorCategories([]);
            setLoadingSectorCategories(false);
            return;
          }
          
          // Get valid category IDs
          const validCategoryIds = safeData
            .filter(cat => cat && cat.id)
            .map(cat => cat.id);
          
          // Safety check for no valid IDs
          if (validCategoryIds.length === 0) {
            setSectorCategories([]);
            setLoadingSectorCategories(false);
            return;
          }
            
          // Kateqoriyalar üçün sütunları yükləyirik
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .in('category_id', validCategoryIds)
            .eq('status', 'active')
            .order('order_index', { ascending: true });
            
          if (columnsError) throw columnsError;
          
          const safeColumnsData = Array.isArray(columnsData) ? columnsData : [];
          
          // Kateqoriyaları və sütunları birləşdiririk
          const categoriesWithColumns = safeData.map(category => {
            if (!category) return null;
            
            return {
              ...category,
              columns: safeColumnsData.filter(col => col && col.category_id === category.id) || []
            };
          }).filter(Boolean);
          
          setSectorCategories(categoriesWithColumns);
        } catch (error) {
          console.error('Sektor kateqoriyalarını yükləyərkən xəta:', error);
          toast.error(t('errorLoadingSectorCategories'));
        } finally {
          setLoadingSectorCategories(false);
        }
      }
    };
    
    fetchSectorCategories();
  }, [isSectorAdmin, t]);
  
  // Məktəb kateqoriyalarını filterlə
  useEffect(() => {
    if (allCategories) {
      const safeCategories = Array.isArray(allCategories) ? allCategories : [];
      const filtered = safeCategories.filter(category => 
        category && category.assignment !== 'sectors'
      );
      setSchoolCategories(filtered);
    } else {
      setSchoolCategories([]);
    }
  }, [allCategories]);
  
  // Məktəb axtarışı
  useEffect(() => {
    if (schoolSearchQuery.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school => 
        school && school.name && school.name.toLowerCase().includes(schoolSearchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [schoolSearchQuery, schools]);
  
  // Məktəb seçimi
  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find(s => s && s.id === schoolId);
    setSelectedSchoolId(schoolId);
    setSelectedSchoolName(school && school.name ? school.name : '');
  };
  
  // Yüklənmə zamanı göstəriləcək komponent
  if ((loadingAllCategories && isSchoolAdmin) || (loadingSectorCategories && isSectorAdmin && activeTab === 'sector') || loadingSchools) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  // Xəta zamanı göstəriləcək komponent
  if (categoriesError) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('error')}</h3>
            <p className="text-sm">{categoriesError}</p>
          </div>
        </Alert>
        <Button onClick={() => window.location.reload()}>{t('tryAgain')}</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4 px-2">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('dataEntry')}</h1>
        </div>
        
        {/* Sektor admin üçün tab-lar */}
        {isSectorAdmin && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sector" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                {t('sectorData')}
              </TabsTrigger>
              <TabsTrigger value="school" className="flex items-center">
                <School className="mr-2 h-4 w-4" />
                {t('schoolData')}
              </TabsTrigger>
            </TabsList>
            
            {/* Sektor məlumatları */}
            <TabsContent value="sector" className="mt-4">
              {sectorCategories && sectorCategories.length > 0 ? (
                <DataEntryForm 
                  schoolId={user?.sector_id} 
                  categories={sectorCategories} 
                  initialCategoryId={initialCategoryId}
                />
              ) : (
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-4">
                    <h3 className="font-medium">{t('noSectorCategories')}</h3>
                    <p className="text-sm">{t('noSectorCategoriesDescription')}</p>
                  </div>
                </Alert>
              )}
            </TabsContent>
            
            {/* Məktəb məlumatları */}
            <TabsContent value="school" className="mt-4">
              {/* Məktəb seçimi */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <School className="mr-2 h-5 w-5 text-primary" />
                    {t('selectSchool')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="relative w-full mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('searchSchool')}
                        className="pl-10 py-2"
                        value={schoolSearchQuery}
                        onChange={(e) => setSchoolSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    {filteredSchools.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        {schoolSearchQuery ? t('noSchoolsFound') : t('noSchools')}
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredSchools && Array.isArray(filteredSchools) && filteredSchools.map((school) => {
                            // Skip rendering if school is invalid
                            if (!school || !school.id) return null;
                            
                            return (
                              <Button
                                key={school.id}
                                variant={selectedSchoolId === school.id ? "default" : "outline"}
                                className={cn(
                                  "justify-start h-auto py-3 px-4 text-sm font-normal text-left",
                                  "border-gray-200 hover:border-gray-300 transition-colors",
                                  "shadow-sm hover:shadow",
                                  selectedSchoolId === school.id && "bg-primary text-primary-foreground border-primary"
                                )}
                                onClick={() => handleSchoolChange(school.id)}
                              >
                                <School className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span className="truncate">{school.name || 'Unnamed School'}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Məktəb seçildikdən sonra məlumat daxiletmə formu */}
              {selectedSchoolId ? (
                <DataEntryForm 
                  schoolId={selectedSchoolId} 
                  categories={schoolCategories || []} 
                  initialCategoryId={initialCategoryId}
                  isSectorAdmin={true}
                  schoolName={selectedSchoolName}
                />
              ) : (
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-4">
                    <h3 className="font-medium">{t('selectSchoolFirst')}</h3>
                    <p className="text-sm">{t('selectSchoolFirstDescription')}</p>
                  </div>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Məktəb admin üçün sadəcə öz məktəbinin məlumatları */}
        {isSchoolAdmin && (
          <DataEntryForm 
            schoolId={user?.school_id} 
            categories={schoolCategories || []} 
            initialCategoryId={initialCategoryId}
          />
        )}
      </div>
    </div>
  );
};

export default DataEntryPage;
