
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryFilter } from '@/types/category';
import { format } from 'date-fns';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import CategoryList from '@/components/categories/CategoryList';

const Categories = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    assignment: 'all',
    deadline: '',
    status: 'active'
  });
  
  const { 
    categories, 
    loading, 
    error, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    fetchCategories
  } = useCategories();
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditCategory = (category: Category) => {
    setSelectedCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      assignment: category.assignment || 'all',
      deadline: category.deadline ? new Date(category.deadline).toISOString().split('T')[0] : '',
      status: category.status || 'active'
    });
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    setSelectedCategoryId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedCategoryId) {
      try {
        await deleteCategory(selectedCategoryId);
        setIsDeleteDialogOpen(false);
        setSelectedCategoryId(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };
  
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        assignment: categoryForm.assignment as 'all' | 'sectors',
        deadline: categoryForm.deadline ? new Date(categoryForm.deadline).toISOString() : null,
        status: categoryForm.status,
        priority: 0
      };
      
      if (selectedCategoryId) {
        await updateCategory(selectedCategoryId, categoryData);
      } else {
        await addCategory(categoryData);
      }
      
      setCategoryForm({
        name: '',
        description: '',
        assignment: 'all',
        deadline: '',
        status: 'active'
      });
      
      setIsAddDialogOpen(false);
      setSelectedCategoryId(null);
    } catch (error) {
      console.error('Error with category operation:', error);
    }
  };
  
  const handleDialogClose = () => {
    setCategoryForm({
      name: '',
      description: '',
      assignment: 'all',
      deadline: '',
      status: 'active'
    });
    setSelectedCategoryId(null);
  };
  
  const handleViewCategory = (id: string) => {
    window.location.href = `/columns?category=${id}`;
  };
  
  return (
    <>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t('categories')}</h1>
              <p className="text-muted-foreground mt-1">{t('categoriesDescription')}</p>
            </div>
            
            <AddCategoryDialog 
              isOpen={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) handleDialogClose();
              }}
              categoryForm={categoryForm}
              handleFormChange={handleFormChange}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmitCategory}
              selectedCategoryId={selectedCategoryId}
            />
          </div>
          
          <CategoryFilterCard 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={fetchCategories}
          />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('categoryList')}</CardTitle>
              <CardDescription>
                {filteredCategories.length} {t('categoryFound')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  {t('errorLoadingCategories')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('categoryName')}</TableHead>
                      <TableHead>{t('assignment')}</TableHead>
                      <TableHead>{t('deadline')}</TableHead>
                      <TableHead className="text-center">{t('columnsCount')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                          <div className="text-xs text-muted-foreground mt-1">{category.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {category.assignment === 'all' ? t('allSchools') : t('onlySectors')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {category.deadline ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(category.deadline), 'dd.MM.yyyy')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{category.column_count || 0}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            category.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.status === 'active' ? t('active') : t('inactive')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleViewCategory(category.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {!loading && filteredCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noCategoriesFound')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
      
      <DeleteCategoryDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default Categories;
