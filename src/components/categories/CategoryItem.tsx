
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, MoreVertical } from 'lucide-react';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryItemProps {
  category: Category;
  onCategorySelect: (categoryId: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onCategorySelect }) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktiv', className: 'bg-green-100 text-green-800 border-green-200' },
      inactive: { label: 'Deaktiv', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      draft: { label: 'Qaralama', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      archived: { label: 'Arxivlənmiş', className: 'bg-red-100 text-red-800 border-red-200' },
      approved: { label: 'Təsdiqlənmiş', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      pending: { label: 'Gözləmədə', className: 'bg-orange-100 text-orange-800 border-orange-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getAssignmentBadge = (assignment: string) => {
    const assignmentConfig = {
      all: { label: 'Hamısı', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      schools: { label: 'Məktəblər', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      sectors: { label: 'Sektorlar', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      regions: { label: 'Regionlar', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' }
    };
    
    const config = assignmentConfig[assignment as keyof typeof assignmentConfig] || assignmentConfig.all;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Müəyyən edilməyib';
    try {
      return new Date(dateString).toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Yanlış tarix';
    }
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 
                 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm
                 hover:from-white hover:to-blue-50/30 hover:-translate-y-1"
      onClick={() => onCategorySelect(category.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-semibold text-slate-800 group-hover:text-blue-700 
                                transition-colors line-clamp-2">
              {category.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(category.status || 'active')}
              {getAssignmentBadge(category.assignment || 'all')}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200">
              <DropdownMenuItem>Redaktə et</DropdownMenuItem>
              <DropdownMenuItem>Kopyala</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {category.description && (
          <CardDescription className="text-slate-600 line-clamp-2 leading-relaxed">
            {category.description}
          </CardDescription>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{category.column_count || 0}</span>
            <span>sütun</span>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-600">
            <Users className="h-4 w-4 text-green-500" />
            <span className="font-medium">{category.completion_rate || 0}%</span>
            <span>tamamlandı</span>
          </div>
        </div>
        
        {category.deadline && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Son tarix:</span>
            <span className="font-medium">{formatDate(category.deadline.toString())}</span>
          </div>
        )}
        
        {category.priority && category.priority > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-slate-600">Prioritet:</span>
            <div className="flex space-x-1">
              {[...Array(Math.min(category.priority, 5))].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryItem;
