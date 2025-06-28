import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ColumnStatus } from '@/types/dashboard';

interface ColumnStatusGridProps {
  columns: ColumnStatus[];
  onColumnClick?: (categoryId: string, columnId: string) => void;
  groupBy?: 'category' | 'status';
  showFilter?: boolean;
  loading?: boolean;
}

const ColumnStatusGrid: React.FC<ColumnStatusGridProps> = ({
  columns,
  onColumnClick,
  groupBy = 'category',
  showFilter = false,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Heç bir sütun tapılmadı</p>
        </CardContent>
      </Card>
    );
  }

  // Group columns by category
  const groupedColumns = columns.reduce((acc, column) => {
    const key = column.categoryName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(column);
    return acc;
  }, {} as Record<string, ColumnStatus[]>);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Tamamlandı', className: 'bg-green-500 text-white' },
      pending: { variant: 'secondary' as const, label: 'Gözləyir', className: 'bg-yellow-500 text-white' },
      rejected: { variant: 'destructive' as const, label: 'Rədd edildi', className: 'bg-red-500 text-white' },
      empty: { variant: 'outline' as const, label: 'Boş', className: 'border-gray-300' }
    };
    
    const config = statusConfig[status] || statusConfig.empty;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sütun Vəziyyətləri</h3>
        {showFilter && (
          <div className="text-sm text-muted-foreground">
            {columns.length} sütun
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedColumns).map(([categoryName, categoryColumns]) => (
          <Card key={categoryName} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{categoryName}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {categoryColumns.length} sahə
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onColumnClick?.(column.categoryId, column.id)}
                  >
                    <span className="text-sm truncate flex-1 mr-2" title={column.name}>
                      {column.name}
                    </span>
                    {getStatusBadge(column.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ColumnStatusGrid;
