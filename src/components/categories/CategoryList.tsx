
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Category, CategoryFilter } from '@/types/category';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash, Archive, Eye, EyeOff } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  filter: CategoryFilter;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  onEditCategory,
  filter
}) => {
  const { t } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Filtered categories based on current filter
  const filteredCategories = categories.filter(category => {
    // Filter by status if specified
    if (filter.status && category.status !== filter.status) {
      return false;
    }
    
    // Filter by archived status
    if (!filter.showArchived && category.archived) {
      return false;
    }
    
    // Filter by search term if specified
    if (filter.search && !category.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    // Filter by assignment if specified
    if (filter.assignment && category.assignment !== filter.assignment) {
      return false;
    }
    
    return true;
  });
  
  // Handle category status toggle
  const handleStatusToggle = async (categoryId: string, currentStatus: 'active' | 'inactive') => {
    // For demonstration only: in a real app, this would be an API call
    toast.success(
      currentStatus === 'active' 
        ? t('categoryDeactivated')
        : t('categoryActivated')
    );
  };
  
  // Handle category deletion
  const handleDelete = async (categoryId: string) => {
    // For demonstration only: in a real app, this would be an API call
    toast.success(t('categoryDeleted'));
    setConfirmDelete(null);
  };
  
  // Handle category archive toggle
  const handleArchiveToggle = async (categoryId: string, isArchived: boolean) => {
    // For demonstration only: in a real app, this would be an API call
    toast.success(
      isArchived 
        ? t('categoryUnarchived')
        : t('categoryArchived')
    );
  };
  
  const getAssignmentBadge = (assignment: 'all' | 'sectors') => {
    return assignment === 'all' 
      ? <Badge variant="secondary">{t('allRegions')}</Badge>
      : <Badge variant="outline">{t('sectorsOnly')}</Badge>;
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">{t('name')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            <TableHead>{t('assignment')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t('noMatchingRecordsFound')}
              </TableCell>
            </TableRow>
          ) : (
            filteredCategories.map((category) => (
              <TableRow key={category.id} className={category.archived ? 'bg-muted/50' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    {category.archived && <Badge variant="outline">{t('archived')}</Badge>}
                  </div>
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{getAssignmentBadge(category.assignment)}</TableCell>
                <TableCell>
                  <Switch
                    checked={category.status === 'active'}
                    onCheckedChange={() => handleStatusToggle(
                      category.id, 
                      category.status
                    )}
                    className="ml-0"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditCategory(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>{t('edit')}</span>
                      </DropdownMenuItem>
                      <AlertDialog open={confirmDelete === category.id} onOpenChange={(open) => {
                        if (!open) setConfirmDelete(null);
                      }}>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setConfirmDelete(category.id);
                          }}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>{t('delete')}</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteConfirmationMessage')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
                              {t('confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <DropdownMenuItem onClick={() => handleArchiveToggle(category.id, category.archived)}>
                        {category.archived ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>{t('unarchive')}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            <span>{t('archive')}</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryList;
