
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, MoreVertical, Star } from 'lucide-react';
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
      active: { label: 'Aktiv', className: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold' },
      inactive: { label: 'Deaktiv', className: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold' },
      draft: { label: 'Qaralama', className: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold' },
      archived: { label: 'Arxivlənmiş', className: 'bg-rose-100 text-rose-800 border-rose-200 font-semibold' },
      approved: { label: 'Təsdiqlənmiş', className: 'bg-blue-100 text-blue-800 border-blue-200 font-semibold' },
      pending: { label: 'Gözləmədə', className: 'bg-orange-100 text-orange-800 border-orange-200 font-semibold' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant="outline" className={`${config.className} px-3 py-1 rounded-full`}>{config.label}</Badge>;
  };

  const getAssignmentBadge = (assignment: string) => {
    const assignmentConfig = {
      all: { label: 'Hamısı', className: 'bg-purple-100 text-purple-800 border-purple-200 font-semibold' },
      schools: { label: 'Məktəblər', className: 'bg-blue-100 text-blue-800 border-blue-200 font-semibold' },
      sectors: { label: 'Sektorlar', className: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold' },
      regions: { label: 'Regionlar', className: 'bg-cyan-100 text-cyan-800 border-cyan-200 font-semibold' }
    };
    
    const config = assignmentConfig[assignment as keyof typeof assignmentConfig] || assignmentConfig.all;
    return <Badge variant="outline" className={`${config.className} px-3 py-1 rounded-full`}>{config.label}</Badge>;
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
      className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 
                 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 backdrop-blur-sm
                 hover:from-white hover:via-blue-50/50 hover:to-indigo-50/30 hover:-translate-y-2
                 rounded-2xl overflow-hidden relative"
      onClick={() => onCategorySelect(category.id)}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-600/5 
                    group-hover:to-indigo-600/10 transition-all duration-500 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-700 
                                transition-colors line-clamp-2 leading-tight">
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
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-9 w-9 p-0
                         hover:bg-slate-100/80 rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 rounded-xl shadow-xl">
              <DropdownMenuItem className="rounded-lg">Redaktə et</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">Kopyala</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 rounded-lg">Sil</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-5 relative z-10">
        {category.description && (
          <CardDescription className="text-slate-600 line-clamp-2 leading-relaxed text-base">
            {category.description}
          </CardDescription>
        )}
        
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800">{category.column_count || 0}</span>
              <span className="block text-xs text-slate-500">sütun</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800">{category.completion_rate || 0}%</span>
              <span className="block text-xs text-slate-500">tamamlandı</span>
            </div>
          </div>
        </div>
        
        {category.deadline && (
          <div className="flex items-center space-x-3 text-sm text-slate-600 pt-3 border-t border-slate-100/50">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Son tarix</span>
              <span className="font-semibold text-slate-800">{formatDate(category.deadline.toString())}</span>
            </div>
          </div>
        )}
        
        {category.priority && category.priority > 0 && (
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm text-slate-600 font-medium">Prioritet</span>
            <div className="flex space-x-1">
              {[...Array(Math.min(category.priority, 5))].map((_, i) => (
                <Star 
                  key={i} 
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
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
