
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Category, CategoryStatus, CategoryFilter } from "@/types/category";
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { 
  Plus, Search, Edit, Trash2, Archive, MoreVertical, 
  AlertTriangle, Filter, SortAsc, SortDesc, Eye, EyeOff
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  filter: CategoryFilter;
  isLoading?: boolean;
  isError?: boolean;
  onDeleteCategory?: (id: string) => Promise<boolean>;
  onUpdateStatus?: (id: string, status: 'active' | 'inactive') => Promise<boolean>;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  onEditCategory,
  filter,
  isLoading = false,
  isError = false,
  onDeleteCategory,
  onUpdateStatus
}) => {
  const { t } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredCategories = categories.filter(category => {
    if (filter.status && category.status !== filter.status) {
      return false;
    }
    
    if (!filter.archived && category.archived) {
      return false;
    }
    
    if (filter.search && !category.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    if (filter.assignment && category.assignment !== filter.assignment) {
      return false;
    }
    
    return true;
  });

  const filterByStatus = (categories: Category[], status: CategoryStatus | 'all') => {
    if (status === 'all') return categories;

    return categories.filter(category => {
      if (status === 'active' && category.status === 'active') return true;
      if (status === 'inactive' && category.status === 'inactive') return true;
      if (status === 'archived' && category.archived) return true;
      return false;
    });
  };

  const handleStatusToggle = async (categoryId: string, currentStatus: string) => {
    if (currentStatus !== 'active' && currentStatus !== 'inactive') {
      toast.error(t('cannotToggleSpecialStatus'));
      return;
    }
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (onUpdateStatus) {
      const success = await onUpdateStatus(categoryId, newStatus);
      if (success) {
        toast.success(
          currentStatus === 'active' 
            ? t('categoryDeactivated')
            : t('categoryActivated')
        );
      } else {
        toast.error(t('statusUpdateFailed'));
      }
    } else {
      toast.success(
        currentStatus === 'active' 
          ? t('categoryDeactivated')
          : t('categoryActivated')
      );
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (onDeleteCategory) {
      const success = await onDeleteCategory(categoryId);
      if (success) {
        toast.success(t('categoryDeleted'));
      } else {
        toast.error(t('deleteFailed'));
      }
    } else {
      toast.success(t('categoryDeleted'));
    }
    
    setConfirmDelete(null);
  };

  const handleArchiveToggle = async (categoryId: string, isArchived: boolean) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p>{t('loading')}...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-red-500">{t('errorLoadingData')}</p>
      </div>
    );
  }

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
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.status === 'active'}
                      onCheckedChange={() => handleStatusToggle(
                        category.id, 
                        category.status
                      )}
                      disabled={category.status !== 'active' && category.status !== 'inactive'}
                    />
                    {category.status !== 'active' && category.status !== 'inactive' && (
                      <Badge 
                        variant={
                          category.status === 'active' ? 'default' :
                          category.status === 'inactive' ? 'secondary' :
                          category.status === 'archived' ? 'destructive' :
                          'default'
                        }
                      >
                        {t(category.status)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('openMenu')}</span>
                        <MoreVertical className="h-4 w-4" />
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
                            <Trash2 className="mr-2 h-4 w-4" />
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
                      <DropdownMenuItem onClick={() => handleArchiveToggle(category.id, !!category.archived)}>
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
