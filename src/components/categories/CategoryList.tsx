
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Category, CategoryAssignment, CategoryFilter } from '@/types/category';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CategoryListProps {
  categories: Category[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (category: Category) => void;
  onViewColumns: (categoryId: string) => void;
  loading?: boolean;
  filter?: CategoryFilter;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onDelete,
  onArchive,
  onEdit,
  onViewColumns,
  loading = false,
  filter = { 
    status: 'active', 
    assignment: '', 
    archived: false, 
    showArchived: false 
  }
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Filtreləmə funksiyasını tətbiq edirik
    const filtered = categories.filter(category => {
      // Status filter
      if (filter.status && filter.status !== 'all' && category.status !== filter.status) {
        return false;
      }
      
      // Assignment filter
      if (
        filter.assignment && 
        filter.assignment !== '' && 
        category.assignment !== filter.assignment
      ) {
        return false;
      }
      
      // Archived filter
      if ((filter.archived === true || filter.showArchived === true) && category.archived !== true) {
        return false;
      }
      
      if ((filter.archived === false || filter.showArchived === false) && category.archived === true) {
        return false;
      }
      
      // Search filter
      if (filter.search && filter.search.trim() !== '') {
        const searchLower = filter.search.toLowerCase();
        return (
          category.name.toLowerCase().includes(searchLower) ||
          (category.description?.toLowerCase().includes(searchLower) || false)
        );
      }
      
      return true;
    });

    setFilteredCategories(filtered);
  }, [categories, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'archived':
        return <Badge variant="outline">{t('archived')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAssignmentBadge = (assignment: CategoryAssignment) => {
    switch (assignment) {
      case 'all':
        return <Badge variant="success">{t('allUsers')}</Badge>;
      case 'sectors':
        return <Badge variant="warning">{t('sectorsOnly')}</Badge>;
      case 'specific':
        return <Badge variant="info">{t('specific')}</Badge>;
      default:
        return <Badge variant="outline">{assignment}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="py-4 text-center">
        <p>{t('noCategoriesFound')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t('categoryName')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('description')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('assignment')}</TableHead>
            <TableHead>{t('priority')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCategories.map((category) => {
            const isArchived = category.archived === true;
            const isActive = category.status === 'active';
            const isInactive = category.status === 'inactive';
            
            return (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {category.description || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(category.status)}</TableCell>
                <TableCell>{getAssignmentBadge(category.assignment)}</TableCell>
                <TableCell>{category.priority}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewColumns(category.id)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {t('columns')}
                    </button>
                    <button
                      onClick={() => onEdit(category)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      {t('edit')}
                    </button>
                    {!isArchived && (
                      <button
                        onClick={() => onArchive(category.id)}
                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                      >
                        {t('archive')}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(category.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryList;
