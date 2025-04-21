
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { PendingItem } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface PendingItemsProps {
  items: PendingItem[];
}

const PendingItems: React.FC<PendingItemsProps> = ({ items }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingApprovals')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noApprovals')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1 mb-2 sm:mb-0">
                <h4 className="font-medium">{item.title}</h4>
                {item.schoolName && (
                  <p className="text-sm text-muted-foreground">
                    {t('school')}: {item.schoolName}
                  </p>
                )}
                {item.categoryName && (
                  <p className="text-sm text-muted-foreground">
                    {t('category')}: {item.categoryName}
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={
                      item.status === 'pending' 
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                        : item.status === 'approved'
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                    }
                  >
                    {t(item.status)}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/data-entry/review/${item.id}`)}
              >
                {t('review')}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingItems;
