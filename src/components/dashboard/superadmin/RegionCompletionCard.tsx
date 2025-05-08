
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface RegionData {
  id: string;
  name: string;
  completion_rate?: number;
  status?: string;
}

interface RegionCompletionCardProps {
  regions: RegionData[];
}

const RegionCompletionCard: React.FC<RegionCompletionCardProps> = ({ regions }) => {
  // Sort regions by completion rate in descending order
  const sortedRegions = [...regions].sort((a, b) => 
    (b.completion_rate || 0) - (a.completion_rate || 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Region tamamlanma dərəcələri</CardTitle>
      </CardHeader>
      <CardContent>
        {regions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Region məlumatları yoxdur</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tamamlanma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell>
                    {region.status === 'active' ? (
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
                      <Progress value={region.completion_rate || 0} className="h-2 w-full" />
                      <span className="text-sm font-medium">
                        {region.completion_rate || 0}%
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

export default RegionCompletionCard;
