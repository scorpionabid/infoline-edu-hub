
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Building, ChevronRight, School } from 'lucide-react';
import { RegionStats } from '@/types/dashboard';

interface RegionsListProps {
  regions: RegionStats[];
  className?: string;
}

const RegionsList: React.FC<RegionsListProps> = ({ regions, className }) => {
  const { t } = useLanguage();

  if (!regions || regions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('regions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('noRegions')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('regions')}</CardTitle>
        <Button variant="outline" asChild size="sm">
          <Link to="/regions">{t('viewAll')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regions.map((region) => (
            <div 
              key={region.id} 
              className="p-4 border rounded-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{region.name}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="h-3 w-3 mr-1" />
                      <span>{region.sectorCount} {t('sectors')}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <School className="h-3 w-3 mr-1" />
                      <span>{region.schoolCount} {t('schools')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    {region.completionRate || 0}%
                  </div>
                  <div className="w-24 md:w-32">
                    <Progress value={region.completionRate || 0} className="h-2" />
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/regions/${region.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionsList;
