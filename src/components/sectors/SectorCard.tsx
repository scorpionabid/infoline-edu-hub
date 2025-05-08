
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector, EnhancedSector } from '@/types/supabase';

interface SectorCardProps {
  sector: Sector | EnhancedSector;
  onClick?: () => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, onClick }) => {
  const isEnhanced = 'school_count' in sector || 'schoolCount' in sector;
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">{sector.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {sector.description && (
          <p className="text-sm text-muted-foreground mb-4">{sector.description}</p>
        )}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Region:</p>
            <p className="text-muted-foreground">{sector.region_name || sector.regionName || 'Unknown'}</p>
          </div>
          <div>
            <p className="font-medium">Status:</p>
            <div className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              sector.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {sector.status}
            </div>
          </div>
          {isEnhanced && (
            <>
              <div>
                <p className="font-medium">Schools:</p>
                <p>{(sector as EnhancedSector).school_count || (sector as EnhancedSector).schoolCount}</p>
              </div>
              <div>
                <p className="font-medium">Completion:</p>
                <p>{Math.round((sector as EnhancedSector).completion_rate || (sector as EnhancedSector).completionRate || 0)}%</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Created: {new Date(sector.created_at).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};

export default SectorCard;
