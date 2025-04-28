import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Category, CategoryFilter, FormStatus } from '@/types/category';
import { Badge } from "../ui/badge";
import { CalendarIcon, CheckCircle, Clock, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { useLanguage } from '@/context/LanguageContext';
import EditCategoryDialog from './EditCategoryDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useToast } from '../ui/use-toast';
import { Progress } from '../ui/progress';
import { useNavigate } from 'react-router-dom';

interface CategoryListProps {
  categories: Category[];
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
  filter: CategoryFilter;
}

interface CategoryCardProps {
  category: Category;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

const getStatusInfo = (status: string, deadline?: Date, completionPercentage?: number) => {
  const now = new Date();
  let statusBadge: FormStatus = 'pending';
  let statusColor = 'bg-gray-500'; // Default gray
  let statusText = 'Pending';

  // Check if deadline is valid
  if (deadline && !isNaN(deadline.getTime())) {
    // Calculate days until deadline
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      statusBadge = 'overdue';
      statusColor = 'bg-red-500';
      statusText = 'Overdue';
    } else if (diffDays <= 3) {
      statusBadge = 'dueSoon';
      statusColor = 'bg-amber-500';
      statusText = 'Due Soon';
    }
  }

  // If we have completion data, override status based on it
  if (typeof completionPercentage === 'number') {
    if (completionPercentage === 100) {
      statusBadge = 'completed';
      statusColor = 'bg-green-500';
      statusText = 'Completed';
    }
  }

  // Override with actual status if it's rejected or approved
  if (status === 'rejected') {
    statusBadge = 'rejected';
    statusColor = 'bg-red-500';
    statusText = 'Rejected';
  } else if (status === 'approved') {
    statusBadge = 'approved';
    statusColor = 'bg-green-500';
    statusText = 'Approved';
  } else if (status === 'draft') {
    statusBadge = 'draft';
    statusColor = 'bg-slate-500';
    statusText = 'Draft';
  }

  return { statusBadge, statusColor, statusText };
};

export function CategoryList({ categories, onUpdate, onDelete, filter }: CategoryListProps) {
  const { t } = useLanguage();

  if (!categories || categories.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 flex justify-center items-center">
          {t('noCategoriesFound')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function CategoryCard({ category, onUpdate, onDelete }: CategoryCardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const statusInfo = getStatusInfo(category.status, category.deadline, category.completionPercentage);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCategory = async (updatedCategory: Category) => {
    try {
      await onUpdate(updatedCategory);
      setIsEditDialogOpen(false);
      toast({
        title: t('categoryUpdated'),
        description: t('categoryUpdatedSuccessfully'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('errorUpdatingCategory'),
        description: error.message || t('unknownError'),
      });
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await onDelete(category.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: t('categoryDeleted'),
        description: t('categoryDeletedSuccessfully'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('errorDeletingCategory'),
        description: error.message || t('unknownError'),
      });
    }
  };

  // Format deadline if it exists
  const deadlineDisplay = category.deadline ? formatDate(category.deadline as string) : '-';
  
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
          <CardDescription className="mt-1">{category.description || t('noDescription')}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>{t('edit')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/categories/${category.id}/columns`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>{t('manageCategoryColumns')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t('status')}:</span>
            <Badge variant={statusInfo.statusBadge}>{t(statusInfo.statusBadge)}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t('deadline')}:</span>
            <span className="flex items-center text-sm">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {deadlineDisplay}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t('assignment')}:</span>
            <span className="text-sm">{t(category.assignment)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t('columns')}:</span>
            <span className="text-sm">{category.column_count || 0}</span>
          </div>
          
          {typeof category.completionPercentage === 'number' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('completion')}:</span>
                <span className="text-sm">{category.completionPercentage}%</span>
              </div>
              <Progress value={category.completionPercentage} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4 flex justify-between">
        <div className="text-xs text-gray-500">{t('createdAt')}: {formatDate(category.created_at as string)}</div>
      </CardFooter>
      
      {isEditDialogOpen && (
        <EditCategoryDialog 
          category={category} 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onSave={handleSaveCategory} 
        />
      )}
      
      {isDeleteDialogOpen && (
        <DeleteCategoryDialog 
          category={category} 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen} 
          onDelete={handleDeleteCategory} 
        />
      )}
    </Card>
  );
}
