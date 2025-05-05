import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Column, columnTypes } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Icons } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColumnListProps {
  columns: Column[];
  categories: { id: string; name: string }[];
  isLoading: boolean;
  isError: boolean;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (id: string, name: string) => void;
  onUpdateStatus: (id: string, status: 'active' | 'inactive') => void;
  canManageColumns: boolean;
}

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  categories,
  isLoading,
  isError,
  onEditColumn,
  onDeleteColumn,
  onUpdateStatus,
  canManageColumns,
}) => {
  const { t } = useLanguage();

  // Kateqoriya adını ID əsasında tap
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : t('unknownCategory');
  };

  // Sütunun tipinə uyğun badge rəngini təyin et
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'number':
      case 'range':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100';
      case 'select':
      case 'radio':
      case 'checkbox':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'date':
      case 'time':
      case 'datetime':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
      case 'file':
      case 'image':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-100';
      case 'email':
      case 'url':
      case 'phone':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100';
      case 'color':
      case 'password':
      case 'richtext':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  // Status badge rəngini təyin et
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'draft':
        return <Badge variant="outline">{t('draft')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('columns')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('columns')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('type')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('required')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column) => {
                const typeInfo = columnTypes[column.type] || { 
                  label: column.type, 
                  description: t('unknownColumnType'),
                  icon: 'circle'
                };
                const IconComponent = iconComponents[typeInfo.icon] || Edit;
                
                return (
                  <TableRow key={column.id}>
                    <TableCell className="font-medium">{column.name}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(column.type)}`}>
                                <IconComponent className="w-3 h-3 mr-1" />
                                {typeInfo?.label || column.type}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{typeInfo?.description || t('columnTypeDescription')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{getCategoryName(column.category_id)}</TableCell>
                    <TableCell>
                      {column.is_required 
                        ? <Badge variant="secondary">{t('yes')}</Badge> 
                        : <Badge variant="outline">{t('no')}</Badge>
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(column.status)}</TableCell>
                    <TableCell className="text-right">
                      {canManageColumns ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditColumn(column)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteColumn(column.id, column.name)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {column.status === 'active' ? (
                              <DropdownMenuItem onClick={() => onUpdateStatus(column.id, 'inactive')}>
                                {t('deactivate')}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => onUpdateStatus(column.id, 'active')}>
                                {t('activate')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button variant="ghost" size="icon" disabled>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Əvvəlki iconComponents obyektini silək və Icons-dan istifadə edək
const iconComponents = {
  text: Icons.text,
  textAlignLeft: Icons.alignLeft,
  hash: Icons.hash,
  calendar: Icons.calendar,
  listBox: Icons.listChoice,
  check: Icons.check,
  circle: Icons.circle,
  file: Icons.fileUp,
  image: Icons.image,
  mail: Icons.mail,
  link: Icons.link,
  phone: Icons.phone,
  sliders: Icons.sliders,
  palette: Icons.palette,
  lock: Icons.lock,
  clock: Icons.clock,
  calendarClock: Icons.calendarClock,
  formattingTwo: Icons.fileEdit,
  edit: Edit
};

export default ColumnList;
