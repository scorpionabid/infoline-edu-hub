import React, { useCallback, useEffect, useState } from 'react';
import { useDataEntry } from '@/hooks/useDataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, School } from 'lucide-react';
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

const DataEntryPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryId = queryParams.get('categoryId');
  const statusFilter = queryParams.get('status');
  const { isSchoolAdmin, isSectorAdmin, canViewSectorCategories, sectorId } = usePermissions();
  
  // Sektoradmin üçün məktəb seçimi
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState<boolean>(false);
  
  // useCategoryData hook-u ilə real məlumatları əldə edirik
  const { categories, loading, error } = useCategoryData(isSchoolAdmin ? user?.schoolId : selectedSchoolId);
  const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(0);
  
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
          
          setSchools(data || []);
          // İlk məktəbi seçirik
          if (data && data.length > 0 && !selectedSchoolId) {
            setSelectedSchoolId(data[0].id);
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
  }, [isSectorAdmin, sectorId, t]);
  
  // Kateqoriyaları filter edirik
  const filteredCategories = React.useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    
    return categories.filter(category => {
      if (isSchoolAdmin && category.assignment === 'sectors') {
        return false;
      }
      
      if (canViewSectorCategories) {
        return true;
      }
      
      return category.assignment === 'all';
    });
  }, [categories, isSchoolAdmin, canViewSectorCategories]);
  
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
    schoolId: isSchoolAdmin ? user?.schoolId : selectedSchoolId,
    initialCategoryId,
    statusFilter
  });
  
  // Kateqoriya dəyişdikdə URL-i yeniləyirik
  useEffect(() => {
    if (currentCategory) {
      const newParams = new URLSearchParams(location.search);
      newParams.set('categoryId', currentCategory.id);
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    }
  }, [currentCategory, location.pathname, location.search, navigate]);
  
  // Yüklənmə zamanı göstəriləcək komponent
  if (loading || loadingEntry || loadingSchools) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  // Xəta zamanı göstəriləcək komponent
  if (error || entryError) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-4">
            <h3 className="font-medium">{t('error')}</h3>
            <p className="text-sm">{error || entryError}</p>
          </div>
        </Alert>
        <Button onClick={() => window.location.reload()}>{t('tryAgain')}</Button>
      </div>
    );
  }
  
  // Kateqoriya tapılmadıqda göstəriləcək komponent
  if (filteredCategories.length === 0) {
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
  
  // Seçilmiş kateqoriya
  const selectedCategory = currentCategory || filteredCategories[0];
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('dataEntry')}</h1>
          
          {/* Sektoradmin üçün məktəb seçimi */}
          {isSectorAdmin && (
            <div className="flex items-center space-x-2">
              <School className="h-5 w-5 text-muted-foreground" />
              <Select
                value={selectedSchoolId || ''}
                onValueChange={(value) => setSelectedSchoolId(value)}
                disabled={loadingSchools}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder={t('selectSchool')} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Məktəb seçilmədikdə mesaj */}
        {isSectorAdmin && !selectedSchoolId && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <div className="ml-4">
              <h3 className="font-medium">{t('selectSchoolFirst')}</h3>
              <p className="text-sm">{t('selectSchoolFirstDescription')}</p>
            </div>
          </Alert>
        )}
        
        {/* Əgər məktəb seçilibsə və ya istifadəçi məktəb admindisə, formu göstəririk */}
        {(selectedSchoolId || isSchoolAdmin) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Kateqoriyalar siyahısı */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('categories')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-15rem)]">
                      <div className="space-y-1 p-2">
                        {filteredCategories.map((category, index) => (
                          <Button
                            key={category.id}
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
                            {category.name}
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
              
              {/* Məlumat daxiletmə formu */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedCategory?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[calc(100vh-15rem)]">
                      <form onSubmit={handleSubmit} className="space-y-6 p-2">
                        {selectedCategory?.columns.map((column) => (
                          <div key={column.id} className="space-y-2">
                            <label htmlFor={column.id} className="text-sm font-medium">
                              {column.name}
                              {column.is_required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {/* Sütun tipinə görə input */}
                            {column.type === 'text' && (
                              <input
                                type="text"
                                id={column.id}
                                name={column.id}
                                value={formData[column.id] || ''}
                                onChange={handleInputChange}
                                placeholder={column.placeholder || ''}
                                className="w-full p-2 border rounded-md"
                                required={column.is_required}
                              />
                            )}
                            
                            {column.type === 'textarea' && (
                              <textarea
                                id={column.id}
                                name={column.id}
                                value={formData[column.id] || ''}
                                onChange={handleInputChange}
                                placeholder={column.placeholder || ''}
                                className="w-full p-2 border rounded-md min-h-[100px]"
                                required={column.is_required}
                              />
                            )}
                            
                            {column.type === 'number' && (
                              <input
                                type="number"
                                id={column.id}
                                name={column.id}
                                value={formData[column.id] || ''}
                                onChange={handleInputChange}
                                placeholder={column.placeholder || ''}
                                className="w-full p-2 border rounded-md"
                                required={column.is_required}
                              />
                            )}
                            
                            {column.type === 'select' && (
                              <select
                                id={column.id}
                                name={column.id}
                                value={formData[column.id] || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                required={column.is_required}
                              >
                                <option value="">{t('select')}</option>
                                {column.options && column.options.map((option: any, index: number) => (
                                  <option key={index} value={option.value || option}>
                                    {option.label || option}
                                  </option>
                                ))}
                              </select>
                            )}
                            
                            {column.type === 'date' && (
                              <input
                                type="date"
                                id={column.id}
                                name={column.id}
                                value={formData[column.id] || ''}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                required={column.is_required}
                              />
                            )}
                            
                            {column.type === 'checkbox' && (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={column.id}
                                  name={column.id}
                                  checked={formData[column.id] === 'true'}
                                  onChange={(e) => handleInputChange({
                                    target: {
                                      name: column.id,
                                      value: e.target.checked ? 'true' : 'false'
                                    }
                                  } as React.ChangeEvent<HTMLInputElement>)}
                                  className="mr-2"
                                />
                                <label htmlFor={column.id}>{column.placeholder || column.name}</label>
                              </div>
                            )}
                            
                            {column.help_text && (
                              <p className="text-xs text-gray-500">{column.help_text}</p>
                            )}
                          </div>
                        ))}
                        
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
          </>
        )}
      </div>
    </div>
  );
};

export default DataEntryPage;
