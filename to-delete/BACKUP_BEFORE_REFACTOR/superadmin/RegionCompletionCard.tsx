
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RegionCompletionCardProps {
  regions: any[];
}

const RegionCompletionCard: React.FC<RegionCompletionCardProps> = ({ regions = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Region Completion</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {regions.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">No region data available</div>
        ) : (
          <div className="space-y-4">
            {regions.map(region => (
              <div key={region.id} className="flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{region.name}</span>
                  <span className="text-sm font-medium">{region.completionRate || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${region.completionRate || 0}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionCompletionCard;
