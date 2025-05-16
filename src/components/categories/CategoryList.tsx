import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, PlusCircle, Search, Trash } from 'lucide-react';
import { Category, CategoryFilter, CategoryStatus } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onCategoryDelete?: (id: string) => void;
  onFilterChange?: (filter: CategoryFilter) => void;
  filter?: CategoryFilter;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  isLoading,
  onCategoryDelete,
  onFilterChange,
  filter = {}
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(filter.search || '');
  const [activeTab, setActiveTab] = useState<string>("active");

  const handleAddCategory = () => {
    navigate('/categories/new');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        ...filter,
        search: e.target.value
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onFilterChange) {
      onFilterChange({
        ...filter,
        status: value === 'all' ? undefined : [value as CategoryStatus],
        archived: value === 'archived'
      });
    }
  };

  const getStatusBadge = (status?: CategoryStatus | string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{t('draft')}</Badge>;
      case 'archived':
        return <Badge className="bg-red-100 text-red-700 border-red-200">{t('archived')}</Badge>;
      case 'approved':
          return <Badge className="bg-green-100 text-green-700 border-green-200">{t('approved')}</Badge>;
      default:
        return <Badge>{t('unknown')}</Badge>;
    }
  };

  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    if (filter.search) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(filter.search!.toLowerCase())
      );
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(category => filter.status?.includes(category.status as CategoryStatus));
    }

    return filtered;
  }, [categories, filter]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
        <CardDescription>{t('manageCategories')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder={t('searchCategories')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 shadow-sm"
            />
          </div>
          <Button onClick={handleAddCategory}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addCategory')}
          </Button>
        </div>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">{t('active')}</TabsTrigger>
            <TabsTrigger value="inactive">{t('inactive')}</TabsTrigger>
            <TabsTrigger value="draft">{t('draft')}</TabsTrigger>
            <TabsTrigger value="archived">{t('archived')}</TabsTrigger>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {filteredCategories.filter(c => c.status === 'active').length === 0 ? (
              <EmptyState message={t('noActiveCategories')} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.filter(c => c.status === 'active').map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/categories/${category.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </Button>
                        {onCategoryDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onCategoryDelete(category.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="inactive">
            {filteredCategories.filter(c => c.status === 'inactive').length === 0 ? (
              <EmptyState message={t('noInactiveCategories')} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.filter(c => c.status === 'inactive').map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/categories/${category.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </Button>
                        {onCategoryDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onCategoryDelete(category.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="draft">
            {filteredCategories.filter(c => c.status === 'draft').length === 0 ? (
              <EmptyState message={t('noDraftCategories')} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.filter(c => c.status === 'draft').map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/categories/${category.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </Button>
                        {onCategoryDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onCategoryDelete(category.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="archived">
            {filteredCategories.filter(c => c.archived).length === 0 ? (
              <EmptyState message={t('noArchivedCategories')} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.filter(c => c.archived).map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/categories/${category.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </Button>
                        {onCategoryDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onCategoryDelete(category.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="all">
            {filteredCategories.length === 0 ? (
              <EmptyState message={t('noCategoriesFound')} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/categories/${category.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view')}
                        </Button>
                        {onCategoryDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onCategoryDelete(category.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
