import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, CheckCircle, Info, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  deadline?: string;
}

interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  help_text?: string;
}

interface DataEntryContextProps {
  selectedCategory: string | null;
  selectedColumn: string | null;
  onCategoryChange: (categoryId: string) => void;
  onColumnChange: (columnId: string) => void;
  mode: 'single' | 'bulk';
  className?: string;
  
  // 🆕 Yeni parametrlər (optional - backwards compatible)
  userRole?: string;
  entryType?: 'school' | 'sector';
}

export const DataEntryContext: React.FC<DataEntryContextProps> = ({
  selectedCategory,
  selectedColumn,
  onCategoryChange,
  onColumnChange,
  mode,
  className,
  
  // 🆕 Yeni parametrlər
  userRole,
  entryType = 'school'
}) => {
  // Categories Query - role-based filtering əlavə edildi
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories', userRole, entryType],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('status', 'active');
      
      // 🎯 Role-based filtering
      if (userRole === 'sectoradmin' && entryType === 'sector') {
        // Sektoradmin sector mode-da: yalnız 'sectors' və 'all' assignment-li kategoriler
        query = query.in('assignment', ['sectors', 'all']);
      } else if (userRole === 'schooladmin' || entryType === 'school') {
        // Məktəb adminləri və school mode: yalnız 'all' assignment-li kategoriler
        query = query.eq('assignment', 'all');
      }
      // SuperAdmin və RegionAdmin üçün filterlə yoxdur (hər şeyi görür)
      
      const { data, error } = await query.order('name');
        
      if (error) throw error;
      return data as Category[];
    }
  });
  
  // Columns Query
  const { data: columns, isLoading: columnsLoading, error: columnsError } = useQuery({
    queryKey: ['columns', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      
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

  // Get selected category and column details
  const selectedCategoryDetails = categories?.find(c => c.id === selectedCategory);
  const selectedColumnDetails = columns?.find(c => c.id === selectedColumn);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value);
    onColumnChange(''); // Reset column selection
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
          <Settings className="h-6 w-6" />
          Kateqoriya ve Sutun Secimi
        </h2>
        <p className="text-muted-foreground">
          {entryType === 'sector'
            ? mode === 'single'
              ? 'Sektor ucun melumat daxil edilecek kateqoriya ve sutunu secin'
              : 'Sektor ucun coxlu melumat daxil edilecek kateqoriya ve sutunu secin'
            : mode === 'single' 
              ? 'Bir mekteb ucun melumat daxil edilecek kateqoriya ve sutunu secin'
              : 'Coxlu mekteb ucun melumat daxil edilecek kateqoriya ve sutunu secin'
          }
        </p>
      </div>

      {/* Context Setup Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Melumat Konteksti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label htmlFor="category-select" className="text-base font-medium">
              1. Kateqoriya Secin
            </Label>
            
            {categoriesError ? (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Kateqoriyalar yuklenerk xeta bas verdi</span>
              </div>
            ) : (
              <Select 
                value={selectedCategory || ''} 
                onValueChange={handleCategoryChange}
                disabled={categoriesLoading}
              >
                <SelectTrigger id="category-select" className="h-12">
                  <SelectValue placeholder="Kateqoriya secin..." />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="flex justify-center p-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{category.name}</span>
                          {category.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-40">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}

            {selectedCategoryDetails && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-primary">
                      {selectedCategoryDetails.name}
                    </div>
                    {selectedCategoryDetails.description && (
                      <div className="text-xs text-muted-foreground">
                        {selectedCategoryDetails.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={selectedCategoryDetails.assignment === 'sectors' ? 'default' : 'outline'} 
                        className={`text-xs ${
                          selectedCategoryDetails.assignment === 'sectors' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : ''
                        }`}
                      >
                        {selectedCategoryDetails.assignment === 'all' 
                          ? 'Butun istifadeciler' 
                          : selectedCategoryDetails.assignment === 'sectors'
                          ? '🏢 Sektorlara aid'
                          : 'Diger'
                        }
                      </Badge>
                      {selectedCategoryDetails.deadline && (
                        <Badge variant="outline" className="text-xs">
                          Son tarix: {new Date(selectedCategoryDetails.deadline).toLocaleDateString()}
                        </Badge>
                      )}
                      {entryType === 'sector' && (
                        <Badge variant="secondary" className="text-xs">
                          🏢 Sektor melumat rejimi
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Column Selection */}
          {selectedCategory && (
            <div className="space-y-3">
              <Label htmlFor="column-select" className="text-base font-medium">
                2. Sutun Secin
              </Label>
              
              {columnsError ? (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">Sutunlar yuklenerk xeta bas verdi</span>
                </div>
              ) : (
                <Select 
                  value={selectedColumn || ''} 
                  onValueChange={onColumnChange}
                  disabled={columnsLoading}
                >
                  <SelectTrigger id="column-select" className="h-12">
                    <SelectValue placeholder="Sutun secin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {columnsLoading ? (
                      <div className="flex justify-center p-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      columns?.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{column.name}</span>
                              {column.is_required && (
                                <Badge variant="destructive" className="text-xs">Mecburi</Badge>
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
                      ))
                    )}
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
                            Mecburi sahe
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {selectedCategory && selectedColumn && (
        <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <div className="text-sm font-medium text-primary">
                  Kontekst Hazirdir
                </div>
                <p className="text-sm text-muted-foreground">
                  Siz <strong>{selectedCategoryDetails?.name}</strong> kateqoriyasinda{' '}
                  <strong>{selectedColumnDetails?.name}</strong> sutunu ucun{' '}
                  {entryType === 'sector'
                    ? 'sektor melumat'
                    : mode === 'single' 
                      ? 'bir mektebe' 
                      : 'coxlu mektebe'
                  } melumat daxil edeceksiniz.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {selectedCategoryDetails?.name}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">
                    {selectedColumnDetails?.name}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="default">
                    {entryType === 'sector'
                      ? 'Sektor'
                      : mode === 'single' 
                        ? 'Tek mekteb' 
                        : 'Bulk mekteb'
                    }
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Messages */}
      {!selectedCategory && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Kateqoriya secin</span>
          </div>
        </div>
      )}

      {selectedCategory && !selectedColumn && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Sutun secin</span>
          </div>
        </div>
      )}
    </div>
  );
};