
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SectorData {
  id: string;
  name: string;
  region_name?: string;
  completion_rate?: number;
  status?: string;
}

interface SectorCompletionCardProps {
  sectors: SectorData[];
}

const SectorCompletionCard: React.FC<SectorCompletionCardProps> = ({ sectors }) => {
  // Sort sectors by completion rate in descending order
  const sortedSectors = [...sectors].sort((a, b) => 
    (b.completion_rate || 0) - (a.completion_rate || 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sektor tamamlanma dərəcələri</CardTitle>
      </CardHeader>
      <CardContent>
        {sectors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Sektor məlumatları yoxdur</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sektor</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tamamlanma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>{sector.region_name || 'N/A'}</TableCell>
                  <TableCell>
                    {sector.status === 'active' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Qeyri-aktiv
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={sector.completion_rate || 0} className="h-2 w-full" />
                      <span className="text-sm font-medium">
                        {sector.completion_rate || 0}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorCompletionCard;
