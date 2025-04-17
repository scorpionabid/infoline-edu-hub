
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertTriangle, MoreHorizontal, Edit, Trash2, CalendarClock, Timer, AlertCircle, Save, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Category, CategoryStatus } from '@/types/category';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { FormStatus } from '@/types/form';

export interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  handleStatusChange?: (id: string, status: CategoryStatus) => Promise<boolean>;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories,
  isLoading,
  onEdit,
  onDelete,
  handleStatusChange
}) => {
  const navigate = useNavigate();

  // Kategoriyaları prioritet və deadlineə görə sıralayaq
  const sortedCategories = [...categories].sort((a, b) => {
    // Əvvəlcə prioritet üzrə
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0);
    }
    
    // Sonra deadline üzrə
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    
    // deadline olmayan kategoriyalar sonda olsun
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    
    // son olaraq ad üzrə
    return a.name.localeCompare(b.name);
  });
  
  const handleEditClick = (category: Category) => {
    if (onEdit) {
      onEdit(category);
    }
  };
  
  const handleDeleteClick = (category: Category) => {
    if (onDelete) {
      onDelete(category);
    }
  };
  
  const handleStatusClick = async (categoryId: string, newStatus: CategoryStatus) => {
    if (handleStatusChange) {
      await handleStatusChange(categoryId, newStatus);
    }
  };
  
  // Deadline formatlaması
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return '';
    
    try {
      const date = new Date(deadline);
      return format(date, 'd MMMM yyyy', { locale: az });
    } catch (error) {
      console.error('Tarix formatı xətası:', error);
      return deadline;
    }
  };
  
  // Deadline statusunu hesablayaq (yaxınlaşan, keçmiş və s.)
  const getDeadlineStatus = (deadline?: string): 'upcoming' | 'today' | 'past' | null => {
    if (!deadline) return null;
    
    try {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const deadlineOnly = new Date(deadlineDate);
      deadlineOnly.setHours(0, 0, 0, 0);
      
      if (deadlineOnly.getTime() === today.getTime()) {
        return 'today';
      } else if (deadlineOnly > today) {
        return 'upcoming';
      } else {
        return 'past';
      }
    } catch (error) {
      console.error('Tarix hesablama xətası:', error);
      return null;
    }
  };

  // Status üçün badge komponentini qaytaraq
  const renderStatusBadge = (status: CategoryStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Aktiv</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Deaktiv</Badge>;
      case 'draft':
        return <Badge variant="outline">Qaralama</Badge>;
      default:
        return null;
    }
  };
  
  // Form statusu üçün badge
  const renderFormStatusBadge = (status: string) => {
    switch (status) {
      case FormStatus.COMPLETED:
        return <Badge variant="success">Tamamlanıb</Badge>;
      case FormStatus.PENDING:
        return <Badge variant="secondary">Gözləmədə</Badge>;
      case FormStatus.REJECTED:
        return <Badge variant="destructive">Rədd edilib</Badge>;
      case FormStatus.DUE_SOON:
        return <Badge variant="warning">Tezliklə</Badge>;
      case FormStatus.OVERDUE:
        return <Badge variant="destructive">Gecikib</Badge>;
      case FormStatus.APPROVED:
        return <Badge variant="success">Təsdiqlənib</Badge>;
      case FormStatus.DRAFT:
        return <Badge variant="outline">Qaralama</Badge>;
      default:
        return null;
    }
  };
  
  // Assignment (təyinat) üçün badge
  const renderAssignmentBadge = (assignment?: string) => {
    switch (assignment) {
      case 'sectors':
        return <Badge variant="outline">Sektorlar</Badge>;
      case 'all':
      default:
        return <Badge variant="outline">Hamısı</Badge>;
    }
  };
  
  // Deadline badge-i
  const renderDeadlineBadge = (deadline?: string) => {
    const status = getDeadlineStatus(deadline);
    
    if (!deadline || !status) return null;
    
    switch (status) {
      case 'today':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Bu gün
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {formatDeadline(deadline)}
          </Badge>
        );
      case 'past':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {formatDeadline(deadline)}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Status ikonlarını FormStatus enum standartına uyğunlaşdıraq.
  const getStatusIcon = (status: string) => {
    switch (status) {
      case FormStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case FormStatus.PENDING:
        return <Clock className="h-4 w-4 text-orange-500" />;
      case FormStatus.REJECTED:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case FormStatus.DUE_SOON:
        return <Timer className="h-4 w-4 text-amber-500" />;
      case FormStatus.OVERDUE:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case FormStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case FormStatus.DRAFT:
        return <Save className="h-4 w-4 text-gray-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Kategoriya kartları
  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : sortedCategories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Kateqoriya tapılmadı</p>
          </CardContent>
        </Card>
      ) : (
        sortedCategories.map((category) => (
          <Card key={category.id} className={cn(
            "hover:bg-accent/5 transition-colors",
            category.status === 'inactive' && "opacity-70"
          )}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-1 space-y-1 mb-2 md:mb-0">
                  <div className="flex items-center justify-between md:justify-start gap-2">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <div className="flex items-center gap-1">
                      {renderStatusBadge(category.status)}
                      {renderAssignmentBadge(category.assignment)}
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {renderDeadlineBadge(category.deadline)}
                    {category.column_count !== undefined && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Sütunlar: {category.column_count}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/columns?categoryId=${category.id}`)}
                  >
                    Sütunlar
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleEditClick(category)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Redaktə et
                      </DropdownMenuItem>
                      
                      {category.status === 'active' ? (
                        <DropdownMenuItem 
                          onClick={() => handleStatusClick(category.id, 'inactive')}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Deaktiv et
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleStatusClick(category.id, 'active')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aktiv et
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(category)}
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CategoryList;
