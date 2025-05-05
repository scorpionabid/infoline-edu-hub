
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { AlertTriangle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormStatusSectionProps {
  dueSoonCount: number;
  overdueCount: number;
  totalCount: number;
}

const FormStatusSection: React.FC<FormStatusSectionProps> = ({ 
  dueSoonCount, 
  overdueCount, 
  totalCount 
}) => {
  // Hesablamalar
  const dueSoonPercentage = totalCount ? Math.round((dueSoonCount / totalCount) * 100) : 0;
  const overduePercentage = totalCount ? Math.round((overdueCount / totalCount) * 100) : 0;
  
  return (
    <Grid columns={2} className="gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4 text-amber-500" />
              Son tarix yaxınlaşanlar
            </CardTitle>
            <span className="text-2xl font-bold">{dueSoonCount}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faiz</span>
              <span>{dueSoonPercentage}%</span>
            </div>
            <Progress value={dueSoonPercentage} className={cn("h-2", dueSoonPercentage > 30 ? "bg-amber-200" : "")} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Növbəti 7 gün ərzində son tarixi olan formlar
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
              Gecikənlər
            </CardTitle>
            <span className="text-2xl font-bold">{overdueCount}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faiz</span>
              <span>{overduePercentage}%</span>
            </div>
            <Progress value={overduePercentage} className={cn("h-2", overduePercentage > 0 ? "bg-red-200" : "")} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Son tarixi keçmiş və tamamlanmamış formlar
          </p>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default FormStatusSection;
