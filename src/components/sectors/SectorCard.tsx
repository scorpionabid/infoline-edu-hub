
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector } from '@/types/supabase';

interface SectorCardProps {
  sector: Sector;
  onClick?: () => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, onClick }) => {
  return (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{sector.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{sector.description || 'No description'}</p>
        <div className="mt-2">
          <span className="text-sm font-medium">Status: </span>
          <span className={`text-sm ${sector.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
            {sector.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorCard;
