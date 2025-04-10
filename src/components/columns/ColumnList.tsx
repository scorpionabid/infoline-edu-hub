
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Column } from '@/hooks/columns';
import { Category } from '@/types/category';

interface ColumnListProps {
  columns: Column[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (id: string, name: string) => void;
  onUpdateStatus: (id: string, status: 'active' | 'inactive') => void;
  canManageColumns?: boolean;
}

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  categories,
  isLoading,
  isError,
  onEditColumn,
  onDeleteColumn,
  onUpdateStatus,
  canManageColumns = false
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-destructive">{t('error')}</h3>
        <p className="text-muted-foreground mt-2">{t('errorLoadingColumns')}</p>
      </div>
    );
  }

  // Kateqoriya adlarını map-ləyək
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : t('unknownCategory');
  };

  // Sütun tipləri üçün badge
  const getColumnTypeBadge = (type: string) => {
    let color = '';
    switch (type) {
      case 'text':
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'number':
        color = 'bg-green-100 text-green-800';
        break;
      case 'date':
        color = 'bg-purple-100 text-purple-800';
        break;
      case 'checkbox':
        color = 'bg-yellow-100 text-yellow-800';
        break;
      case 'radio':
        color = 'bg-orange-100 text-orange-800';
        break;
      case 'select':
        color = 'bg-indigo-100 text-indigo-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    return <Badge className={color}>{t(type)}</Badge>;
  };

  return (
    <div className="bg-card rounded-lg shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>{columns.length} {t('columnsFound')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{t('columnName')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('required')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((column) => (
              <TableRow key={column.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">{column.name}</TableCell>
                <TableCell>{getCategoryName(column.category_id)}</TableCell>
                <TableCell>{getColumnTypeBadge(column.type)}</TableCell>
                <TableCell>{column.is_required ? t('yes') : t('no')}</TableCell>
                <TableCell>
                  <Badge variant={column.status === 'active' ? 'default' : 'secondary'}>
                    {column.status === 'active' ? t('active') : t('inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    {canManageColumns ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="mr-1" onClick={() => onEditColumn(column)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('edit')}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive" 
                              onClick={() => onDeleteColumn(column.id, column.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('delete')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="mr-1">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('view')}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ColumnList;
