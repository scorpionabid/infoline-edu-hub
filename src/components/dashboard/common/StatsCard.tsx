
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsItem } from '@/types/dashboard';
import { Users, School, Building2, MapPin } from 'lucide-react';

interface StatsCardProps {
  stats: StatsItem[];
  className?: string;
}

const getIcon = (title: string) => {
  switch (title.toLowerCase()) {
    case 'users':
      return <Users className="h-5 w-5 text-muted-foreground" />;
    case 'schools':
      return <School className="h-5 w-5 text-muted-foreground" />;
    case 'sectors':
      return <Building2 className="h-5 w-5 text-muted-foreground" />;
    case 'regions':
      return <MapPin className="h-5 w-5 text-muted-foreground" />;
    default:
      return null;
  }
};

const StatsCard: React.FC<StatsCardProps> = ({ stats, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              {item.icon || getIcon(item.title)}
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-2xl font-bold">{item.count}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
