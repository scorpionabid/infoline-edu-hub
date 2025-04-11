
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormCard from './FormCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Form, FormStatus } from '@/types/form';

interface FormTabsProps {
  recentForms: Form[];
  handleFormClick: (formId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ recentForms, handleFormClick }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Formaların kateqoriyalarının siyahısını əldə edir
  const categories = ['all', ...Array.from(new Set(recentForms.map(form => form.category || '')))];
  
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
        form.status === 'dueSoon' || // Son tarixi yaxınlaşan formlar
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
        (form.category && form.category.toLowerCase().includes(query))
      );
    }
    
    return filteredForms;
  };
  
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
              <SelectItem value="dueSoon">{t('dueSoon')}</SelectItem>
              <SelectItem value="empty">{t('noFormsFound')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="recent" className="m-0">
          {filterForms(recentForms, 'recent').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterForms(recentForms, 'recent').map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category || ''}
                  status={form.status}
                  completionPercentage={form.completionPercentage || 0}
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
          {filterForms(recentForms, 'pending').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterForms(recentForms, 'pending').map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category || ''}
                  status={form.status}
                  completionPercentage={form.completionPercentage || 0}
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
          {filterForms(recentForms, 'urgent').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterForms(recentForms, 'urgent').map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category || ''}
                  status={form.status}
                  completionPercentage={form.completionPercentage || 0}
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
