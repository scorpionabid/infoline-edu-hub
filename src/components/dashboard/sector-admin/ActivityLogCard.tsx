
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

export interface ActivityLogCardProps {
  items: {
    id: string;
    action: string;
    target: string;
    date: string;
    user: string;
  }[];
}

export const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ items }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: az });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son fəaliyyətlər</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Fəaliyyət tapılmadı</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <span className="text-sm">{item.target}</span>
                  <span className="text-xs text-muted-foreground">{item.user}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
