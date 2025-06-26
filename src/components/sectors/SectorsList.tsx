
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  region_id: string;
  created_at: string;
}

interface SectorsListProps {
  sectors: Sector[];
  onEdit?: (sector: Sector) => void;
  onDelete?: (sectorId: string) => void;
}

export const SectorsList: React.FC<SectorsListProps> = ({
  sectors,
  onEdit,
  // onDelete
}) => {
  if (!sectors || sectors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Heç bir sektor tapılmadı
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {sectors.map((sector) => (
        <Card key={sector.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{sector.name}</span>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(sector)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(sector.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default SectorsList;
