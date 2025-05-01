
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface StatusCardsProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  title?: string;
}

const StatusCards: React.FC<StatusCardsProps> = ({ stats, title }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        {title && (
          <CardTitle className="text-md font-medium mb-3">{title}</CardTitle>
        )}
        
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/50 p-3 rounded-md text-center">
            <p className="text-sm font-medium text-muted-foreground">Ümumi</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md text-center">
            <p className="text-sm font-medium text-blue-700">Gözləmədə</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{stats.pending}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md text-center">
            <p className="text-sm font-medium text-green-700">Təsdiqlənmiş</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md text-center">
            <p className="text-sm font-medium text-red-700">Rədd edilmiş</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
          </div>
        </div>
        
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${(stats.approved / stats.total) * 100}%` }}
            ></div>
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${(stats.pending / stats.total) * 100}%` }}
            ></div>
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCards;
