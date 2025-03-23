
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
import { Plus, FilePlus, Edit, Trash2, Calendar, Search, Eye } from 'lucide-react';
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

// Kateqoriya interfeysi
interface Category {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline: string;
  status: 'active' | 'inactive';
  createdAt: string;
  columnsCount: number;
}

// Demo kateqoriya datası
const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Ümumi məlumatlar',
    description: 'Məktəb haqqında ümumi məlumatlar',
    assignment: 'all',
    deadline: '2023-12-31',
    status: 'active',
    createdAt: '2023-01-01',
    columnsCount: 8
  },
  {
    id: 'cat2',
    name: 'Müəllim heyəti',
    description: 'Müəllimlər haqqında statistik məlumatlar',
    assignment: 'all',
    deadline: '2023-12-31',
    status: 'active',
    createdAt: '2023-01-05',
    columnsCount: 12
  },
  {
    id: 'cat3',
    name: 'Şagird kontingenti',
    description: 'Şagirdlər haqqında statistik məlumatlar',
    assignment: 'all',
    deadline: '2023-12-31',
    status: 'active',
    createdAt: '2023-01-10',
    columnsCount: 10
  },
  {
    id: 'cat4',
    name: 'Maddi-texniki baza',
    description: 'Məktəbin maddi-texniki bazası haqqında məlumatlar',
    assignment: 'sectors',
    deadline: '2023-12-15',
    status: 'active',
    createdAt: '2023-01-15',
    columnsCount: 15
  },
  {
    id: 'cat5',
    name: 'Tədris planı',
    description: 'Tədris planı və tədris yükü haqqında məlumatlar',
    assignment: 'sectors',
    deadline: '2023-11-30',
    status: 'inactive',
    createdAt: '2023-01-20',
    columnsCount: 6
  }
];

const Categories = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Filter kateqoriyaları
  const filteredCategories = DEMO_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Yeni kateqoriya əlavə etmə
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
    
    toast.success(t('categoryAdded'), {
      description: t('categoryAddedDesc')
    });
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
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  {t('addCategory')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>{t('addCategory')}</DialogTitle>
                  <DialogDescription>
                    {t('addCategoryDescription')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('categoryName')}</Label>
                      <Input id="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('categoryDescription')}</Label>
                      <Textarea id="description" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignment">{t('assignment')}</Label>
                        <Select defaultValue="all">
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
                        <Input id="deadline" type="date" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('saveCategory')}</Button>
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
                <Button variant="ghost" size="sm" className="gap-1">
                  <FilePlus className="h-4 w-4" />
                  {t('importFromExcel')}
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
                {/* Burada əlavə filtrlər əlavə oluna bilər */}
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
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(category.deadline).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{category.columnsCount}</TableCell>
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
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noCategoriesFound')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </>
  );
};

export default Categories;
