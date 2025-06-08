
import React, { useState } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SectorDataEntryForm from './sector/SectorDataEntryForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ColumnType, ColumnOption } from '@/types/column';

export const SectorOnlyDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Load sector categories only
  const { categories, isLoading: categoriesLoading } = useCategoriesQuery({
    assignment: 'sectors'
  });

  // Load columns for selected category with proper type casting
  const { data: columns = [], isLoading: columnsLoading } = useQuery({
    queryKey: ['columns', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', selectedCategoryId)
        .eq('status', 'active')
        .order('order_index');
      
      if (error) throw error;
      
      // Transform database columns to proper Column type
      return (data || []).map(col => ({
        ...col,
        type: col.type as ColumnType,
        status: (col.status === 'active' || col.status === 'inactive') ? col.status : 'active' as 'active' | 'inactive',
        options: Array.isArray(col.options) ? (col.options as any[]).map(opt => {
          if (typeof opt === 'string') {
            return { value: opt, label: opt };
          }
          return {
            value: opt.value || '',
            label: opt.label || opt.value || '',
            ...opt
          };
        }) as ColumnOption[] : [],
        validation: col.validation || {},
        default_value: col.default_value || '',
        help_text: col.help_text || '',
        placeholder: col.placeholder || '',
        is_required: col.is_required || false
      }));
    },
    enabled: !!selectedCategoryId
  });

  // Filter sector categories
  const sectorCategories = categories.filter(cat => 
    cat.assignment === 'sectors' || cat.assignment === 'all'
  );

  if (categoriesLoading) {
    return <LoadingSpinner />;
  }

  if (!user?.sector_id) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Sektor məlumatınız tapılmadı</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Sektor Kateqoriyaları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sectorCategories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Sektor üçün kateqoriya tapılmadı
              </p>
            </div>
          ) : (
            <Tabs value={selectedCategoryId || ''} onValueChange={setSelectedCategoryId}>
              <TabsList className="grid w-full grid-cols-auto gap-2">
                {sectorCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Sektor
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {sectorCategories.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {category.name}
                      </CardTitle>
                      <p className="text-muted-foreground">{category.description}</p>
                    </CardHeader>
                    <CardContent>
                      {columnsLoading ? (
                        <LoadingSpinner />
                      ) : columns.length > 0 ? (
                        <SectorDataEntryForm
                          categoryId={category.id}
                          sectorId={user.sector_id || ''}
                          columns={columns}
                          onComplete={() => {
                            console.log('Sector data entry completed for category:', category.id);
                          }}
                        />
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">
                            Bu kateqoriya üçün hələ sütun təyin edilməyib
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorOnlyDataEntry;
