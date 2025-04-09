
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import {
  PlusCircle,
  ArrowLeft,
  RefreshCw,
  Search,
  SlidersHorizontal,
  CircleOff,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/common/EmptyState';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import useColumns from '@/hooks/columns/useColumns';
import useCategories from '@/hooks/categories/useCategories';

// Stub components for now
const ColumnDialog = ({ isOpen, onClose, column, categoryId }: any) => null;
const ColumnDetailsDialog = ({ isOpen, onClose, column, onEdit, onDelete }: any) => null;

const Columns = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // URL parametrelerini al
  const [searchParams] = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId') || '';
  
  // State değişkenleri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFromUrl);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  
  // Columns hook'unu kullan
  const {
    columns,
    isLoading: columnsLoading,
    getColumns,
    deleteColumn,
  } = useColumns(selectedCategoryId);
  
  // Categories hook'unu kullan
  const {
    categories,
    isLoading: categoriesLoading,
    getCategories,
    getCategoryById,
  } = useCategories();
  
  // Seçilen kategori
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // İlk yükleme ve kategori seçimi değiştiğinde
  useEffect(() => {
    getCategories();
  }, [getCategories]);
  
  useEffect(() => {
    if (selectedCategoryId) {
      getColumns();
      
      // Kategori detaylarını al
      const fetchCategory = async () => {
        const category = await getCategoryById(selectedCategoryId);
        setSelectedCategory(category);
      };
      
      fetchCategory();
    } else {
      setSelectedCategory(null);
    }
  }, [selectedCategoryId, getColumns, getCategoryById]);
  
  // URL değiştiğinde kategori seçimini güncelle
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategoryId(categoryIdFromUrl);
    }
  }, [categoryIdFromUrl]);
  
  // Kategori değiştiğinde URL'yi güncelle
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    navigate(`/columns?categoryId=${value}`);
  };
  
  // Sütun filtreleme
  const filteredColumns = columns.filter(column => {
    // Arama filtresi
    if (
      searchQuery &&
      !column.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Tip filtresi
    if (selectedType !== 'all' && column.type !== selectedType) {
      return false;
    }
    
    // Status filtresi
    if (selectedStatus !== 'all' && column.status !== selectedStatus) {
      return false;
    }
    
    return true;
  });
  
  // Dialog açma fonksiyonları
  const openAddDialog = () => {
    setSelectedColumn(null);
    setIsAddDialogOpen(true);
  };
  
  const openEditDialog = (column: Column) => {
    setSelectedColumn(column);
    setIsAddDialogOpen(true);
  };
  
  const openDetailsDialog = (column: Column) => {
    setSelectedColumn(column);
    setIsDetailsDialogOpen(true);
  };
  
  // Yeni sütun ekleme fonksiyonu
  const handleAddColumn = async (data: Omit<Column, 'id'>) => {
    // Burada sütun ekleme API çağrısı yapılacak
    toast.success('Sütun eklendi!');
    getColumns();
    return true;
  };
  
  // Sütun silme fonksiyonu
  const handleDeleteColumn = async (id: string) => {
    try {
      await deleteColumn(id);
      toast.success('Sütun silindi!');
      return true;
    } catch (error) {
      toast.error('Sütun silinirken hata oluştu!');
      return false;
    }
  };
  
  // Yükleme durumu
  const isLoading = columnsLoading || categoriesLoading;
  
  // Yükleme sırasında gösterilecek içerik
  if (isLoading) {
    return (
      <div className="container py-6">
        <PageHeader title={t('columns')} description={t('columnsDescription')} />
        <Card className="mb-6">
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-4 mt-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </div>
                  <div>
                    <Skeleton className="h-10 w-[120px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      {/* Header */}
      <PageHeader
        title={selectedCategory ? `${selectedCategory.name} - Sütunlar` : 'Sütunlar'}
        description={selectedCategory?.description || 'Kateqoriya sütunlarını idarə edin'}
        backButton={
          <Button variant="outline" size="sm" onClick={() => navigate('/categories')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kateqoriyalara qayıt
          </Button>
        }
      />
      
      {/* Filtrləmə və seçimlər */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedCategoryId || ''}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Sütun axtar..."
                  className="w-full md:w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün tiplər</SelectItem>
                  <SelectItem value="text">Mətn</SelectItem>
                  <SelectItem value="number">Rəqəm</SelectItem>
                  <SelectItem value="date">Tarix</SelectItem>
                  <SelectItem value="select">Seçim</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün statuslar</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                  <SelectItem value="draft">Qaralama</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={() => getColumns()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sütunlar siyahısı */}
      {!selectedCategoryId ? (
        <EmptyState
          icon={<Database className="h-16 w-16 text-muted-foreground" />}
          title="Kateqoriya seçilməyib"
          description="Sütunları görmək üçün kateqoriya seçin"
        />
      ) : filteredColumns.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={<Database className="h-16 w-16 text-muted-foreground" />}
            title="Sütun tapılmadı"
            description={`"${selectedCategory?.name}" kateqoriyası üçün sütun tapılmadı`}
            action={
              <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Sütun əlavə et
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {filteredColumns.length} sütun tapıldı
              </p>
            </div>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Sütun əlavə et
            </Button>
          </div>
          
          {/* Sütun kartları */}
          {filteredColumns.map((column) => (
            <Card key={column.id} className="hover:bg-accent/5 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1 space-y-1 mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{column.name}</h3>
                      <Badge variant={column.status === 'active' ? 'success' : 'secondary'}>
                        {column.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                      </Badge>
                      <Badge variant="outline">{column.type}</Badge>
                      {column.is_required && (
                        <Badge variant="default">Məcburi</Badge>
                      )}
                    </div>
                    
                    {column.help_text && (
                      <p className="text-sm text-muted-foreground">{column.help_text}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(column)}
                    >
                      Detallar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openEditDialog(column)}
                    >
                      Redaktə et
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialoqular */}
      <ColumnDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        column={selectedColumn}
        categoryId={selectedCategoryId}
      />
      
      <ColumnDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        column={selectedColumn}
        onEdit={openEditDialog}
        onDelete={handleDeleteColumn}
      />
    </div>
  );
};

export default Columns;
