import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Edit3,
  Calendar,
  FileText
} from 'lucide-react';
import { CategoryProgress } from '@/hooks/dashboard/useDashboardData';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CategoryProgressCardsProps {
  categories: CategoryProgress[];
  onCategoryClick: (categoryId: string) => void;
  loading?: boolean;
  className?: string;
}

// Status ikonu və rənglər
const getStatusConfig = (status: CategoryProgress['status'], progress: number) => {
  switch (status) {
    case 'approved':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800',
        label: 'Təsdiqləndi'
      };
    case 'completed':
      return {
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        label: 'Tamamlandı'
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        label: 'Gözləyir'
      };
    case 'in-progress':
      return {
        icon: Edit3,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        badge: 'bg-orange-100 text-orange-800',
        label: 'Davam edir'
      };
    case 'not-started':
      return {
        icon: FileText,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50 border-gray-200',
        badge: 'bg-gray-100 text-gray-600',
        label: 'Başlanmadı'
      };
    default:
      return {
        icon: FileText,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50 border-gray-200',
        badge: 'bg-gray-100 text-gray-600',
        label: 'Bilinməz'
      };
  }
};

// Deadline yoxlaması
const getDeadlineStatus = (deadline?: Date) => {
  if (!deadline) return null;
  
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      type: 'overdue',
      message: `${Math.abs(diffDays)} gün gecikib`,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    };
  } else if (diffDays <= 3) {
    return {
      type: 'urgent',
      message: `${diffDays} gün qalıb`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    };
  } else if (diffDays <= 7) {
    return {
      type: 'soon',
      message: `${diffDays} gün qalıb`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
  }
  
  return {
    type: 'normal',
    message: `${diffDays} gün qalıb`,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  };
};

// Tək kateqoriya kartı
const CategoryCard: React.FC<{
  category: CategoryProgress;
  onClick: (categoryId: string) => void;
}> = ({ category, onClick }) => {
  const statusConfig = getStatusConfig(category.status, category.progress);
  const deadlineStatus = getDeadlineStatus(category.deadline);
  const StatusIcon = statusConfig.icon;
  
  const handleClick = () => {
    onClick(category.id);
  };
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1",
        "border-2 hover:border-primary/20",
        statusConfig.bgColor
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
            <div>
              <CardTitle className="text-base line-clamp-1">
                {category.name}
              </CardTitle>
              {category.description && (
                <CardDescription className="text-xs mt-1 line-clamp-2">
                  {category.description}
                </CardDescription>
              )}
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", statusConfig.badge)}>
            {statusConfig.label}
          </Badge>
        </div>
        
        {/* Deadline Warning */}
        {deadlineStatus && (deadlineStatus.type === 'overdue' || deadlineStatus.type === 'urgent') && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
            deadlineStatus.bgColor,
            deadlineStatus.color
          )}>
            <Calendar className="h-3 w-3" />
            {deadlineStatus.message}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tamamlanma</span>
            <span className="font-medium">{category.progress}%</span>
          </div>
          <Progress 
            value={category.progress} 
            className="h-2"
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Ümumi sahələr</div>
            <div className="font-medium">
              {category.filledColumns}/{category.totalColumns}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Məcburi sahələr</div>
            <div className="font-medium">
              {category.filledRequiredColumns}/{category.requiredColumns}
            </div>
          </div>
        </div>
        
        {/* Last Updated */}
        {category.lastUpdated && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              Son yeniləmə: {formatDate(category.lastUpdated)}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <Edit3 className="h-3 w-3 mr-1" />
          {category.progress === 0 ? 'Başlamaq' : 'Davam etdirmək'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Yüklənmə skeleton kartı
const SkeletonCard: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-10" />
          </div>
          <div className="h-2 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-10" />
          </div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-10" />
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Əsas komponent
export const CategoryProgressCards: React.FC<CategoryProgressCardsProps> = ({
  categories,
  onCategoryClick,
  loading = false,
  className
}) => {
  // Yüklənmə halı
  if (loading) {
    return (
      <div className={cn("grid gap-4", className)}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }
  
  // Boş hal
  if (!categories || categories.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          Hələ ki, kateqoriya tapılmadı
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Sistem administratorunuz tərəfindən kateqoriyalar əlavə ediləndə burada görünəcək.
        </p>
      </div>
    );
  }
  
  // Kateqoriyaları prioritet sırası ilə sıralayaq (deadline + status)
  const sortedCategories = [...categories].sort((a, b) => {
    // Əvvəlcə deadline-a görə
    const aDeadline = getDeadlineStatus(a.deadline);
    const bDeadline = getDeadlineStatus(b.deadline);
    
    if (aDeadline?.type === 'overdue' && bDeadline?.type !== 'overdue') return -1;
    if (aDeadline?.type !== 'overdue' && bDeadline?.type === 'overdue') return 1;
    if (aDeadline?.type === 'urgent' && bDeadline?.type !== 'urgent') return -1;
    if (aDeadline?.type !== 'urgent' && bDeadline?.type === 'urgent') return 1;
    
    // Sonra status-a görə
    const statusOrder = {
      'not-started': 0,
      'in-progress': 1,
      'pending': 2,
      'completed': 3,
      'approved': 4
    };
    
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kateqoriya Tərəqqisi</h2>
          <p className="text-sm text-muted-foreground">
            Hər kateqoriya üçün məlumat doldurulma vəziyyəti
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {categories.filter(cat => cat.status === 'approved' || cat.status === 'completed').length} / {categories.length} tamamlandı
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={onCategoryClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryProgressCards;