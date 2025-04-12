
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  Filter
} from 'lucide-react';

// Komponentdən əvvəl status və canEditData funksiyalarını əlavə et
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-amber-500" />;
    default:
      return <FileText className="h-5 w-5 text-blue-500" />;
  }
};

const canEditData = (userRole: string | undefined, dataStatus: string): boolean => {
  // Məktəb admini yalnız pending statusundakı məlumatları redaktə edə bilər
  if (userRole === 'schooladmin') {
    return dataStatus === 'pending';
  }
  
  // SuperAdmin, RegionAdmin, SectorAdmin hər növ məlumatı redaktə edə bilər
  return ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole || '');
};

const DataEntry: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = usePermissions();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<string>('pending');
  
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // URL parametrlərini almanın əsas metodu
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get('categoryId');
  const schoolIdFromUrl = queryParams.get('schoolId');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // TODO: Real API çağırışı
        // Demo data
        const mockCategories = [
          { id: 'cat1', name: 'Əsas Məktəb Məlumatları', deadline: '2025-05-01', status: 'pending' },
          { id: 'cat2', name: 'Müəllim Statistikası', deadline: '2025-05-15', status: 'approved' },
          { id: 'cat3', name: 'Şagird Nailiyyətləri', deadline: '2025-05-20', status: 'rejected' },
          { id: 'cat4', name: 'İnfrastruktur Ehtiyacları', deadline: '2025-06-01', status: 'pending' }
        ];
        
        setCategories(mockCategories);
        
        // URL-dən gələn kateqoriya ID-si varsa, onu default seçilmiş kateqoriya edir
        if (categoryIdFromUrl) {
          setSelectedCategory(categoryIdFromUrl);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Kateqoriyalar yüklənərkən xəta baş verdi:', err);
        setError('Kateqoriyalar yüklənərkən xəta baş verdi');
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [categoryIdFromUrl]);
  
  // Kateqoriya seçimi
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  // Seçilmiş kateqoriyanın məlumatlarını əldə et
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  
  // İnput dəyişikliklərini izləmək
  const handleInputChange = (
    columnId: string,
    value: string | number | boolean | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
  };
  
  // Formu təqdim et
  const handleSubmit = () => {
    console.log('Form təqdim edildi:', {
      categoryId: selectedCategory,
      schoolId: schoolIdFromUrl || user?.schoolId,
      data: formData
    });
    
    // Müvəffəqiyyətli təqdim mesajı
    if (canEditData(userRole, selectedCategoryData?.status)) {
      // TODO: Real API çağırışı
      alert('Məlumatlar uğurla göndərildi!');
    } else {
      alert('Bu məlumatları redaktə etmək hüququnuz yoxdur!');
    }
  };
  
  // Yeni kateqoriya əlavə etmək
  const handleAddCategory = () => {
    // TODO: Yeni kateqoriya əlavə etmək üçün modal göstər
    console.log('Yeni kateqoriya əlavə et');
  };
  
  // Məlumatları filtrləmək
  const handleFilterData = () => {
    // TODO: Filtrləmə funksiyası
    console.log('Məlumatları filtrləmək');
  };
  
  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }
  
  if (error) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center h-[400px]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold">{t('errorOccurred')}</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4"
          >
            {t('refresh')}
          </Button>
        </div>
      </SidebarLayout>
    );
  }
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('dataEntry')}</h1>
            <p className="text-muted-foreground">
              {t('dataEntryDescription')}
            </p>
          </div>
          <div className="flex space-x-2">
            {canEditData(userRole, selectedCategoryData?.status) && (
              <Button onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addCategory')}
              </Button>
            )}
            <Button variant="outline" onClick={handleFilterData}>
              <Filter className="mr-2 h-4 w-4" />
              {t('filter')}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Kateqoriyalar siyahısı */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('categories')}</CardTitle>
                <CardDescription>
                  {t('selectCategoryToFill')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0.5">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full flex items-center p-3 hover:bg-muted transition-colors ${
                        selectedCategory === category.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="mr-2">
                        {getStatusIcon(category.status)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {t('deadline')}: {category.deadline}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Form kontenti */}
          <div className="md:col-span-3">
            {selectedCategory ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCategoryData?.name}</CardTitle>
                  <CardDescription>
                    {isSchoolAdmin
                      ? t('fillCategoryDescription')
                      : t('reviewCategoryDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Form elementləri burada olacaq */}
                    <p className="text-muted-foreground">
                      {canEditData(userRole, selectedCategoryData?.status)
                        ? t('editableFormMessage')
                        : t('nonEditableFormMessage')}
                    </p>
                    
                    {/* Təqdim düyməsi */}
                    {canEditData(userRole, selectedCategoryData?.status) && (
                      <div className="flex justify-end mt-6">
                        <Button onClick={handleSubmit}>
                          {t('submit')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('noSelectedCategory')}</CardTitle>
                  <CardDescription>
                    {t('selectCategoryInstruction')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-10">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">
                      {t('noCategorySelectedMessage')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default DataEntry;
