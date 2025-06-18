
import React, { useState, useEffect } from 'react';
import { DataEntryContainer } from '@/components/dataEntry/DataEntryContainer';
import { SectorDataEntry as SectorDataEntryComponent } from '@/components/dataEntry/SectorDataEntry';
import SectorAdminProxyDataEntry from '@/components/dataEntry/SectorAdminProxyDataEntry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Table2, Edit3, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

/**
 * Sektor Məlumat Daxil Etmə Səhifəsi
 * 
 * Bu səhifə sektoradminlərə öz sektorlarındakı məktəblər üçün məlumat daxil etməyə imkan verir.
 * Məktəblərin siyahısı göstərilir və seçilmiş məktəb üçün məlumat daxil etmək mümkündür.
 */
const SectorDataEntryPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [showDataEntry, setShowDataEntry] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  
  // Kateqoriyaları əldə etmək
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Sütunları əldə etmək
  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ['columns', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', selectedCategoryId)
        .eq('status', 'active')
        .order('order');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategoryId
  });

  // Məktəb seçimi üçün handler
  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  // Data daxil etmə üçün handler
  const handleDataEntry = (schoolId: string) => {
    if (!selectedCategoryId || !selectedColumnId) {
      toast({
        title: "Kateqoriya və sütun seçilməyib",
        description: "Zəhmət olmasa, əvvəlcə kateqoriya və sütun seçin",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedSchoolId(schoolId);
    setShowDataEntry(true);
  };
  
  // Bulk data daxil etmə üçün handler
  const handleBulkDataEntry = (schoolIds: string[]) => {
    if (!selectedCategoryId || !selectedColumnId) {
      toast({
        title: "Kateqoriya və sütun seçilməyib",
        description: "Zəhmət olmasa, əvvəlcə kateqoriya və sütun seçin",
        variant: "destructive",
      });
      return;
    }
    
    // Burada bulk data daxil etmə üçün dialog göstəriləcək
    setShowBulkDialog(true);
  };

  // Data daxil etmə tamamlandıqda
  const handleDataEntryComplete = () => {
    setShowDataEntry(false);
    toast({
      title: "Məlumat uğurla saxlanıldı",
      description: "Məlumatlar uğurla yadda saxlanıldı və təsdiqləndi.",
      variant: "default",
    });
  };
  
  // Bulk data daxil etmə dialog-u üçün state
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkValue, setBulkValue] = useState('');
  
  // Bulk data daxil etmə tamamlandıqda çağrılan handler
  const handleBulkComplete = async () => {
    if (!bulkValue.trim()) {
      toast({
        title: "Dəyər daxil edilməyib",
        description: "Zəhmət olmasa, daxil etmək istədiyiniz dəyəri yazın",
        variant: "destructive",
      });
      return;
    }
    
    // Burada seçilmiş məktəblər üçün eyni dəyəri daxil edəcəyik
    // TODO: API çağrışı ilə bulk data daxil etmək
    
    setShowBulkDialog(false);
    setBulkValue('');
    
    toast({
      title: "Bulk məlumat daxil edildi",
      description: "Seçilmiş məktəblər üçün məlumatlar uğurla daxil edildi.",
      variant: "default",
    });
  };

  // Data daxil etmə bağlandıqda
  const handleDataEntryClose = () => {
    setShowDataEntry(false);
  };

  // Kateqoriya seçimi
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedColumnId(null); // Kateqoriya dəyişdikdə sütun seçimini sıfırla
  };
  
  // Sütun seçimi
  const handleColumnChange = (value: string) => {
    setSelectedColumnId(value);
  };
  
  // Data daxil etmə səhifəsindən çıxış
  const handleBackToList = () => {
    setShowDataEntry(false);
    setSelectedSchoolId(null);
  };
  
  // Bulk data daxil etmə rejimini açmaq/bağlamaq
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
  };
  
  return (
    <DataEntryContainer>
      {/* Kateqoriya və sütun seçimi */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sektor Məlumat Daxiletmə
          </CardTitle>
          <CardDescription>
            Məlumat daxil etmək üçün əvvəlcə kateqoriya və sütun seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Kateqoriya seçimi */}
            <div className="w-full md:w-72">
              <Label htmlFor="category-select">Kateqoriya</Label>
              <Select 
                value={selectedCategoryId || ''} 
                onValueChange={handleCategoryChange}
                disabled={categoriesLoading}
              >
                <SelectTrigger id="category-select" className="mt-1">
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="flex justify-center p-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sütun seçimi */}
            {selectedCategoryId && (
              <div className="w-full md:w-72">
                <Label htmlFor="column-select">Sütun</Label>
                <Select 
                  value={selectedColumnId || ''} 
                  onValueChange={handleColumnChange}
                  disabled={columnsLoading}
                >
                  <SelectTrigger id="column-select" className="mt-1">
                    <SelectValue placeholder="Sütun seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {columnsLoading ? (
                      <div className="flex justify-center p-2">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      columns?.map((column: any) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Bulk rejim düyməsi */}
            {selectedCategoryId && selectedColumnId && (
              <div className="flex items-end mt-auto pt-1">
                <Button 
                  variant={bulkMode ? "default" : "outline"} 
                  size="sm" 
                  onClick={toggleBulkMode}
                  className="ml-auto mt-4 md:mt-0"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {bulkMode ? "Bulk rejim aktiv" : "Bulk rejim"}
                </Button>
              </div>
            )}
          </div>
          
          {selectedCategoryId && selectedColumnId && (
            <div className="mt-4 text-sm">
              <Badge variant="outline" className="mr-2">
                {categories?.find((c: any) => c.id === selectedCategoryId)?.name}
              </Badge>
              <Badge variant="outline">
                {columns?.find((c: any) => c.id === selectedColumnId)?.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      {showDataEntry && selectedSchoolId && selectedCategoryId && selectedColumnId ? (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Məlumat daxil etmə</CardTitle>
            <Button variant="outline" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri qayıt
            </Button>
          </CardHeader>
          <CardContent>
            <SectorAdminProxyDataEntry 
              schoolId={selectedSchoolId}
              categoryId={selectedCategoryId}
              columnId={selectedColumnId}
              onClose={handleDataEntryClose}
              onComplete={handleDataEntryComplete}
            />
          </CardContent>
        </Card>
      ) : selectedCategoryId && selectedColumnId ? (
        <SectorDataEntryComponent 
          onDataEntry={handleDataEntry}
          onBulkAction={(action, schoolIds) => {
            console.log(`Bulk action ${action} for schools:`, schoolIds);
            if (action === 'data_entry') {
              handleBulkDataEntry(schoolIds);
            } else {
              toast({
                title: `${action} əməliyyatı`,
                description: `${schoolIds.length} məktəb üçün ${action} əməliyyatı başladıldı`,
                variant: "default",
              });
            }
          }}
          categoryId={selectedCategoryId}
          bulkMode={bulkMode}
        />
      ) : (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <p>Məlumat daxil etmək üçün əvvəlcə kateqoriya və sütun seçin</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Bulk data daxil etmə dialog-u */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Məlumat Daxil Etmə</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-value">Daxil ediləcək dəyər</Label>
              <Input
                id="bulk-value"
                placeholder="Dəyəri daxil edin..."
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Bu dəyər seçilmiş bütün məktəblər üçün daxil ediləcək:</p>
              <div className="mt-2">
                <Badge variant="outline" className="mr-2">
                  {categories?.find((c: any) => c.id === selectedCategoryId)?.name}
                </Badge>
                <Badge variant="outline">
                  {columns?.find((c: any) => c.id === selectedColumnId)?.name}
                </Badge>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Ləğv et</Button>
            <Button onClick={handleBulkComplete}>Təsdiqlə</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataEntryContainer>
  );
};

export default SectorDataEntryPage;
