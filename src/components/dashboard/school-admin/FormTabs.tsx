
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormCard from './FormCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Form, FormStatus } from '@/types/form';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FormTabsProps {
  recentForms: Form[];
  handleFormClick: (formId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ recentForms: initialForms, handleFormClick }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [loading, setLoading] = useState(false);
  
  // Real data ilə işləyərkən formaları (kateqoriyaları) yükləyən funksiya
  useEffect(() => {
    const fetchForms = async () => {
      if (!user?.schoolId) return;
      
      setLoading(true);
      try {
        // Kateqoriyaları əldə et
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('deadline');
        
        if (categoriesError) throw categoriesError;
        
        // Hər kateqoriya üçün məlumat giriş statistikalarını əldə et
        const formsWithStats = await Promise.all(categories.map(async (category) => {
          // Kateqoriya üçün doldurulmuş məlumatları əldə et
          const { count: filledCount } = await supabase
            .from('data_entries')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('school_id', user.schoolId);
          
          // Kateqoriya üçün təsdiqlənmiş məlumatları əldə et
          const { count: approvedCount } = await supabase
            .from('data_entries')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('school_id', user.schoolId)
            .eq('status', 'approved');
          
          // Kateqoriya üçün rədd edilmiş məlumatları əldə et
          const { count: rejectedCount } = await supabase
            .from('data_entries')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('school_id', user.schoolId)
            .eq('status', 'rejected');
          
          // Kateqoriya üçün sütunları əldə et
          const { count: columnCount } = await supabase
            .from('columns')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          // Status təyin et
          let status: FormStatus = 'pending';
          if (rejectedCount > 0) {
            status = 'rejected';
          } else if (approvedCount === columnCount && columnCount > 0) {
            status = 'approved';
          } else if (category.deadline) {
            const deadlineDate = new Date(category.deadline);
            const now = new Date();
            
            if (deadlineDate < now) {
              status = 'overdue';
            } else if (deadlineDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) { // 3 gün
              status = 'due';
            }
          }
          
          // Tamamlanma faizini hesabla
          let completionPercentage = 0;
          if (columnCount > 0) {
            completionPercentage = Math.round((filledCount / columnCount) * 100);
          }
          
          return {
            id: category.id,
            title: category.name,
            category: 'Əsas',
            status,
            completionPercentage,
            deadline: category.deadline,
            filledCount: filledCount || 0,
            totalCount: columnCount || 0
          };
        }));
        
        setForms(formsWithStats);
      } catch (error) {
        console.error('Formaları yükləyərkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // İlkin formlar yoxdursa və ya formalar boş array isə, real dataları əldə et
    if ((!initialForms || initialForms.length === 0) && user?.schoolId) {
      fetchForms();
    } else {
      setForms(initialForms);
    }
  }, [initialForms, user?.schoolId]);
  
  // Formaların kateqoriyalarının siyahısını əldə edir
  const categories = React.useMemo(() => {
    const categorySet = new Set(['all']);
    forms.forEach(form => {
      if (form.category) {
        categorySet.add(form.category);
      }
    });
    return Array.from(categorySet);
  }, [forms]);
  
  // Axtarış və filtrləmələrdən sonra formaları süzür
  const filterForms = (forms: Form[], tabValue: string) => {
    let filteredForms = [...forms];
    
    // Tab filtri tətbiq edir
    if (tabValue === 'pending') {
      filteredForms = filteredForms.filter(form => form.status === 'pending');
    } else if (tabValue === 'urgent') {
      filteredForms = filteredForms.filter(form => 
        form.status === 'rejected' || 
        form.status === 'overdue' ||
        (form.status === 'due') || // Son tarixi yaxınlaşan formlar
        (form.deadline && new Date(form.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) // 3 gün içində olanlar
      );
    }
    
    // Kateqoriya filtri
    if (selectedCategory !== 'all') {
      filteredForms = filteredForms.filter(form => form.category === selectedCategory);
    }
    
    // Status filtri
    if (selectedStatus !== 'all') {
      filteredForms = filteredForms.filter(form => form.status === selectedStatus as FormStatus);
    }
    
    // Axtarış filtri
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredForms = filteredForms.filter(form => 
        form.title.toLowerCase().includes(query) || 
        form.category?.toLowerCase().includes(query)
      );
    }
    
    return filteredForms;
  };
  
  // Yüklənmə zamanı göstəriləcək
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <section>
      <Tabs defaultValue="recent">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('forms')}</h2>
          <TabsList>
            <TabsTrigger value="recent">{t('recentForms')}</TabsTrigger>
            <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
            <TabsTrigger value="urgent">{t('urgentForms')}</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchForms')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('filterByCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? t('allCategories') : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="approved">{t('approved')}</SelectItem>
              <SelectItem value="rejected">{t('rejected')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
              <SelectItem value="overdue">{t('overdue')}</SelectItem>
              <SelectItem value="due">{t('dueSoon')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="recent" className="m-0">
          {filterForms(forms, 'recent').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterForms(forms, 'recent').map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category}
                  status={form.status}
                  completionPercentage={form.completionPercentage}
                  deadline={form.deadline}
                  onClick={() => handleFormClick(form.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">{t('noFormsFound')}</p>
              <Badge variant="outline" className="mt-2">{searchQuery ? t('adjustSearchFilters') : t('noFormsInThisCategory')}</Badge>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="m-0">
          {filterForms(forms, 'pending').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterForms(forms, 'pending').map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category}
                  status={form.status}
                  completionPercentage={form.completionPercentage}
                  deadline={form.deadline}
                  onClick={() => handleFormClick(form.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">{t('noPendingForms')}</p>
              <Badge variant="outline" className="mt-2">{searchQuery ? t('adjustSearchFilters') : t('allFormsCompleted')}</Badge>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="urgent" className="m-0">
          {filterForms(forms, 'urgent').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterForms(forms, 'urgent').map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category}
                  status={form.status}
                  completionPercentage={form.completionPercentage}
                  deadline={form.deadline}
                  onClick={() => handleFormClick(form.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">{t('noUrgentForms')}</p>
              <Badge variant="outline" className="mt-2">{t('allFormsOnTrack')}</Badge>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default FormTabs;
