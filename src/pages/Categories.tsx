
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import SidebarLayout from '@/components/layout/SidebarLayout';
import {
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import CategoryDialog from '@/components/categories/CategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import CategoryDetailsDialog from '@/components/categories/CategoryDetailsDialog';
import useCategories from '@/hooks/categories/useCategories';
import { Category } from '@/types/category';

const Categories: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    categories, 
    isLoading, 
    deleteCategory,
    getCategories
  } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'sectors' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAssignment = assignmentFilter === 'all' || 
                              category.assignment === assignmentFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                          category.status === statusFilter;
    
    return matchesSearch && matchesAssignment && matchesStatus;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAssignmentFilterChange = (value: 'all' | 'sectors') => {
    setAssignmentFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleOpenDialog = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success(t('categoryDeleted'), {
        description: t('categoryDeletedDesc')
      });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t('errorDeletingCategory'), {
        description: t('errorDeletingCategoryDesc')
      });
      return false;
    }
  };

  const handleAddColumns = (categoryId: string) => {
    navigate(`/columns?categoryId=${categoryId}`);
  };

  const getBadgeForAssignment = (assignment: string) => {
    switch (assignment) {
      case 'sectors':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{t('sectors')}</Badge>;
      case 'all':
      default:
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">{t('all')}</Badge>;
    }
  };

  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">{t('inactive')}</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">{t('draft')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('categories')}</h1>
            <p className="text-muted-foreground">
              {t('categoriesDescription')}
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> {t('addCategory')}
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('searchCategories')}
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-4">
                <div className="w-[180px]">
                  <Select 
                    defaultValue={assignmentFilter}
                    onValueChange={(value: 'all' | 'sectors') => handleAssignmentFilterChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('filterByAssignment')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="sectors">{t('sectors')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select 
                    defaultValue={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="inactive">{t('inactive')}</SelectItem>
                      <SelectItem value="draft">{t('draft')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('description')}</TableHead>
                        <TableHead>{t('assignment')}</TableHead>
                        <TableHead>{t('deadline')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description || '-'}</TableCell>
                            <TableCell>{getBadgeForAssignment(category.assignment)}</TableCell>
                            <TableCell>
                              {category.deadline 
                                ? new Date(category.deadline).toLocaleDateString() 
                                : '-'}
                            </TableCell>
                            <TableCell>{getBadgeForStatus(category.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">{t('openMenu')}</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(category)}>
                                    {t('viewDetails')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                    {t('edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddColumns(category.id)}>
                                    {t('manageColumns')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteCategory(category)}
                                    className="text-destructive"
                                  >
                                    {t('delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {t('noCategories')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialogs */}
      <CategoryDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        category={selectedCategory}
      />
      
      <CategoryDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        category={selectedCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onAddColumns={handleAddColumns}
      />
      
      <DeleteCategoryDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryId={selectedCategory?.id || ''}
        categoryName={selectedCategory?.name || ''}
      />
    </SidebarLayout>
  );
};

export default Categories;
