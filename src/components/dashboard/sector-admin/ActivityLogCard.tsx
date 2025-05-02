
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  date: string;
  entityType: string;
  entityId: string;
}

interface ActivityLogCardProps {
  items: ActivityLogItem[];
}

export const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son fəaliyyətlər</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Göstəriləcək fəaliyyət yoxdur
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son fəaliyyətlər</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.action}</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.user} - {item.entityType}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
