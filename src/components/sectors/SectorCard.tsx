
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Sector, EnhancedSector } from '@/types/supabase';
import { formatDate } from '@/utils/date';
import { 
  SchoolIcon, 
  CheckCircleIcon, 
  PieChartIcon 
} from 'lucide-react';

interface SectorCardProps {
  sector: Sector | EnhancedSector;
  onClick?: () => void;
}

export const SectorCard: React.FC<SectorCardProps> = ({ sector, onClick }) => {
  const { t } = useLanguageSafe();
  
  // Ensure we use regionName or region_name safely
  const regionName = 
    'regionName' in sector ? sector.regionName : 
    'region_name' in sector ? sector.region_name : 
    null;

  // Ensure we use schoolCount or school_count safely
  const schoolCount = 
    'schoolCount' in sector ? sector.schoolCount : 
    'school_count' in sector ? sector.school_count : 
    0;

  // Ensure we use completionRate or completion_rate safely
  const completionRate = 
    'completionRate' in sector ? sector.completionRate : 
    'completion_rate' in sector ? sector.completion_rate : 
    0;

  return (
    <Card 
      className="h-full cursor-pointer transform transition-transform hover:scale-[1.01]"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{sector.name}</CardTitle>
          <Badge variant={sector.status === 'active' ? 'default' : 'outline'}>
            {t(sector.status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {regionName || t('noRegion')}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm">
            <SchoolIcon className="mr-2 h-4 w-4 text-primary" />
            <span>{t('schools')}: {schoolCount}</span>
          </div>
          <div className="flex items-center text-sm">
            <PieChartIcon className="mr-2 h-4 w-4 text-primary" />
            <span>{t('completionRate')}: {Math.round(completionRate)}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        {t('updatedAt')}: {formatDate(sector.updated_at)}
      </CardFooter>
    </Card>
  );
};

export default SectorCard;
