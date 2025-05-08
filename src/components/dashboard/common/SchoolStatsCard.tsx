
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SchoolStat } from '@/types/dashboard';
import { formatDate } from '@/utils/formatters';
import { ExternalLink } from 'lucide-react';

interface SchoolStatsCardProps {
  school: SchoolStat;
  onViewDetails?: (schoolId: string) => void;
}

export const SchoolStatsCard: React.FC<SchoolStatsCardProps> = ({ school, onViewDetails }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Aktiv</Badge>;
      case 'inactive':
        return <Badge variant="outline">Qeyri-aktiv</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressColor = (completion: number) => {
    if (completion >= 80) return 'bg-green-500';
    if (completion >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(school.id);
    } else {
      navigate(`/schools/${school.id}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <span className="truncate">{school.name}</span>
          {getStatusBadge(school.status)}
        </CardTitle>
        <CardDescription>
          {school.principalName && (
            <span className="text-xs">Direktor: {school.principalName}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Tamamlanma</span>
              <span className="font-medium">{school.completionRate}%</span>
            </div>
            <Progress 
              value={school.completionRate} 
              className={`h-2 ${getProgressColor(school.completionRate)}`} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Gözləmədə</p>
              <p className="font-medium">{school.pendingForms || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tamamlanıb</p>
              <p className="font-medium">{school.formsCompleted || 0} / {school.totalForms || 0}</p>
            </div>
          </div>

          {school.lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Son yeniləmə: {formatDate(school.lastUpdate)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-center"
          onClick={handleViewDetails}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Ətraflı
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SchoolStatsCard;
