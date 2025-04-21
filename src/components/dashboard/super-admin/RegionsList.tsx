
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { RegionStats } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RegionsListProps {
  regions: RegionStats[];
  className?: string;
}

const RegionsList: React.FC<RegionsListProps> = ({ regions, className }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getStatusClass = (completionRate: number) => {
    if (completionRate >= 80) return 'text-green-600';
    if (completionRate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  // Regionları tamamlanma faizinə görə sıralayırıq
  const sortedRegions = [...regions].sort((a, b) => 
    (b.completionRate || 0) - (a.completionRate || 0)
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          {t('regions')}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/regions')}
        >
          {t('viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        {sortedRegions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {t('noRegionsFound')}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRegions.map((region) => (
              <div key={region.id} className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-secondary/20 rounded-md transition-colors">
                <div className="col-span-7 lg:col-span-5 flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="truncate font-medium text-sm">{region.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {region.schoolCount} {t('schools')}, {region.sectorCount} {t('sectors')}
                    </p>
                  </div>
                </div>
                <div className="col-span-3 lg:col-span-5">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-primary" 
                      style={{ width: `${region.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className={`text-sm font-medium ${getStatusClass(region.completionRate || 0)}`}>
                    {region.completionRate || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionsList;
