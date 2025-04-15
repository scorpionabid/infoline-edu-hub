
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RegionStats } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface RegionsListProps {
  regions: RegionStats[];
  className?: string;
}

const RegionsList: React.FC<RegionsListProps> = ({ regions, className }) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('regions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {regions.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noRegions')}
            </div>
          ) : (
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{region.name}</h3>
                    <div className="flex space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        {t('sectors')}: {region.sectorCount}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        {t('schools')}: {region.schoolCount}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('completion')}</span>
                      <span>{region.completionRate}%</span>
                    </div>
                    <Progress value={region.completionRate} className="h-2" />
                  </div>
                  
                  <Link to={`/regions/${region.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      {t('viewRegion')}
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RegionsList;
