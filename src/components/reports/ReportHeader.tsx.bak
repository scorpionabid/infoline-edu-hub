
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
}

interface ReportHeaderProps {
  onCategorySelect?: (categoryId: string) => void;
  onFiltersChange?: (filters: any) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ onCategorySelect, onFiltersChange }) => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          {t('reportsDescription')}
        </p>
        
        {/* Category Selection */}
        <div className="w-full md:w-1/3">
          <Label htmlFor="category-select">Kateqoriya:</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={loading}>
            <SelectTrigger id="category-select">
              <SelectValue placeholder="Kateqoriya seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün Kateqoriyalar</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportHeader;
