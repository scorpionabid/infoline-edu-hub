
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Archive } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Column } from '@/types/column';

interface CategoryColumnsProps {
  categoryId: string;
  columns: Column[];
  loading?: boolean;
  onCreateColumn: () => void;
  onEditColumn: (column: Column) => void;
  onArchiveColumn: (column: Column) => void;
}

export const CategoryColumns: React.FC<CategoryColumnsProps> = ({
  categoryId,
  columns,
  loading = false,
  onCreateColumn,
  onEditColumn,
  onArchiveColumn,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t('categoryColumns')}</CardTitle>
        <Button onClick={onCreateColumn} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('addColumn')}
        </Button>
      </CardHeader>
      
      <CardContent>
        {columns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noColumnsFound')}</p>
            <p className="text-sm mt-2">{t('clickAddColumnToStart')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{column.name}</h4>
                    <Badge
                      variant={column.status === 'active' ? 'default' : 'secondary'}
                    >
                      {t(column.type)}
                    </Badge>
                    {column.required && (
                      <Badge variant="outline">{t('required')}</Badge>
                    )}
                  </div>
                  
                  {column.description && (
                    <p className="text-sm text-muted-foreground">
                      {column.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditColumn(column)}
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onArchiveColumn(column)}
                    disabled={loading}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryColumns;
