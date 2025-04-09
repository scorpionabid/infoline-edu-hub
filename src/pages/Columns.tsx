
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import SidebarLayout from '@/components/layout/SidebarLayout';
import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import ColumnDialog from '@/components/columns/ColumnDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import ColumnDetailsDialog from '@/components/columns/ColumnDetailsDialog';
import useColumns from '@/hooks/columns/useColumns';
import useCategories from '@/hooks/categories/useCategories';
import { Column } from '@/types/column';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  const { 
    columns, 
    isLoading, 
    deleteColumn,
    getColumns
  } = useColumns(categoryId || '');
  
  const {
    getCategoryById
  } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  useEffect(() => {
    if (categoryId) {
      getColumns();
      
      const loadCategoryName = async () => {
        try {
          const category = await getCategoryById(categoryId);
          if (category) {
            setCategoryName(category.name);
          }
        } catch (error) {
          console.error('Error loading category:', error);
        }
      };
      
      loadCategoryName();
    } else {
      navigate('/categories');
    }
  }, [categoryId, getColumns, getCategoryById, navigate]);
  
  const filteredColumns = columns.filter(column => {
    const matchesSearch = column.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || column.type === typeFilter;
    
    const matchesStatus = statusFilter === 'all' || column.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleOpenDialog = () => {
    setSelectedColumn(null);
    setIsDialogOpen(true);
  };
  
  const handleEditColumn = (column: Column) => {
    setSelectedColumn(column);
    setIsDialogOpen(true);
  };
  
  const handleViewDetails = (column: Column) => {
    setSelectedColumn(column);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDeleteColumn = (column: Column) => {
    setSelectedColumn(column);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteColumn(id);
      toast.success(t('columnDeleted'), {
        description: t('columnDeletedDesc')
      });
      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error(t('errorDeletingColumn'), {
        description: t('errorDeletingColumnDesc')
      });
      return false;
    }
  };
  
  const handleNavigateBack = () => {
    navigate('/categories');
  };
  
  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'text':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{t('text')}</Badge>;
      case 'number':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">{t('number')}</Badge>;
      case 'select':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">{t('select')}</Badge>;
      case 'date':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">{t('date')}</Badge>;
      case 'checkbox':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">{t('checkbox')}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
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
        <title>{t('columns')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 h-8 w-8" 
            onClick={handleNavigateBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('columns')}</h1>
            <p className="text-muted-foreground">
              {categoryName ? t('columnsForCategory', { category: categoryName }) : t('columnsDescription')}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> {t('addColumn')}
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('searchColumns')}
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-4">
                <select 
                  className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2" 
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                >
                  <option value="all">{t('allTypes')}</option>
                  <option value="text">{t('text')}</option>
                  <option value="number">{t('number')}</option>
                  <option value="select">{t('select')}</option>
                  <option value="date">{t('date')}</option>
                  <option value="checkbox">{t('checkbox')}</option>
                </select>
                <select 
                  className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2" 
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                  <option value="draft">{t('draft')}</option>
                </select>
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
                        <TableHead>{t('type')}</TableHead>
                        <TableHead>{t('isRequired')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredColumns.length > 0 ? (
                        filteredColumns.map((column) => (
                          <TableRow key={column.id}>
                            <TableCell className="font-medium">{column.name}</TableCell>
                            <TableCell>{getBadgeForType(column.type)}</TableCell>
                            <TableCell>
                              {column.is_required ? t('yes') : t('no')}
                            </TableCell>
                            <TableCell>{getBadgeForStatus(column.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">{t('openMenu')}</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(column)}>
                                    {t('viewDetails')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditColumn(column)}>
                                    {t('edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteColumn(column)}
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
                          <TableCell colSpan={5} className="h-24 text-center">
                            {t('noColumns')}
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
      <ColumnDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        column={selectedColumn}
        categoryId={categoryId || ''}
      />
      
      <ColumnDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        column={selectedColumn}
        onEdit={handleEditColumn}
        onDelete={handleDeleteColumn}
      />
      
      <DeleteColumnDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        columnId={selectedColumn?.id || ''}
        columnName={selectedColumn?.name || ''}
      />
    </SidebarLayout>
  );
};

export default Columns;
