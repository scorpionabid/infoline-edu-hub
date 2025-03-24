import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FilePlus, Edit, Trash2, Calendar, Search, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useCategories } from '@/hooks/useCategories';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Category } from '@/types/supabase';

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
            
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) handleDialogClose();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  {t('addCategory')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCategoryId ? t('editCategory') : t('addCategory')}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCategoryId ? t('editCategoryDescription') : t('addCategoryDescription')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitCategory}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('categoryName')}</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={categoryForm.name} 
                        onChange={handleFormChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('categoryDescription')}</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        value={categoryForm.description} 
                        onChange={handleFormChange} 
                        rows={3} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignment">{t('assignment')}</Label>
                        <Select 
                          value={categoryForm.assignment} 
                          onValueChange={(value) => handleSelectChange('assignment', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectAssignment')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('allSchools')}</SelectItem>
                            <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deadline">{t('deadline')}</Label>
                        <Input 
                          id="deadline" 
                          name="deadline"
                          type="date" 
                          value={categoryForm.deadline}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">{t('status')}</Label>
                      <Select 
                        value={categoryForm.status}
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t('active')}</SelectItem>
                          <SelectItem value="inactive">{t('inactive')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {selectedCategoryId ? t('saveChanges') : t('saveCategory')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('filterCategories')}</CardTitle>
                  <CardDescription>{t('filterCategoriesDescription')}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1" 
                  onClick={() => fetchCategories()}
                >
                  <FilePlus className="h-4 w-4" />
                  {t('refresh')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('searchCategories')}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                        <TableCell className="text-center">{category.columnCount || 0}</TableCell>
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCategoryConfirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCategoryWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Categories;
