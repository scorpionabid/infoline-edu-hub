
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, FileText, PenLine, Building } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatusBadge from '../dataEntry/components/StatusBadge';
import { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  const { t } = useLanguage();

  const status = category.status || 'draft';

  const statusClass =
    status === "approved"
      ? "border-green-500"
      : status === "active"
        ? "border-blue-500"
        : status === "draft"
          ? "border-gray-500"
          : "border-red-500";

return (
  <Card className={`hover:shadow-md transition-shadow ${statusClass}`}>
    <CardHeader className="pb-1">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {category.description || t('noDescription')}
          </CardDescription>
        </div>
        <div className="flex flex-col items-end">
          {category.deadline && (
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(category.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{category.column_count || 0}</span>{" "}
            <span className="text-muted-foreground">{t('columns')}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">{category.completionRate !== undefined ? category.completionRate : 0}%</span>{" "}
            <span className="text-muted-foreground">{t('completed')}</span>
          </div>
        </div>

        <Progress 
          value={category.completionRate !== undefined ? category.completionRate : 0} 
          className="h-2 bg-muted" 
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          {category.assignment === 'sectors' && (
            <Badge variant="secondary" className="text-xs mr-2">
              <Building className="w-3 h-3 mr-1" />
              {t('sectors')}
            </Badge>
          )}
          {status === "active" && (
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('active')}
            </Badge>
          )}
        </div>

        <Button 
          size="sm" 
          className="px-3"
          onClick={() => onSelect(category)}
        >
          {status === "approved" ? (
            <>
              <FileText className="w-4 h-4 mr-1" />
              {t('viewDetails')}
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4 mr-1" />
              {t('fillData')}
            </>
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
);
};
