
import React from 'react';
import { Sector } from '@/types/sector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectorCardProps {
  sector: Sector;
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
  onManageAdmin?: (sector: Sector) => void;
  regionNames?: Record<string, string>;
  showRegion?: boolean;
}

const SectorCard: React.FC<SectorCardProps> = ({ 
  sector, 
  onEdit, 
  onDelete,
  onManageAdmin,
  regionNames = {},
  showRegion = true
}) => {
  const { t } = useLanguage();
  
  // Helper function to get region name
  const getRegionName = () => {
    if (!showRegion) return null;
    const regionName = sector.regionName || sector.region_name || regionNames[sector.region_id];
    return regionName || t('unknownRegion') as string;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <div className="truncate">
            {sector.name}
            {showRegion && (
              <div className="text-sm text-gray-600 mt-1 font-normal">
                {t('region')}: {getRegionName()}
              </div>
            )}
          </div>
          <Badge className="ml-2" variant={sector.status === 'active' ? 'default' : 'secondary'}>
            {sector.status === 'active' ? t('active') : t('inactive')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sector.description && (
          <p className="text-sm text-gray-600 mb-4">{sector.description}</p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {sector.admin_email ? (
              <span className="text-gray-600">{sector.admin_email}</span>
            ) : (
              <span className="text-gray-400">{t('noAdmin') as string}</span>
            )}
          </div>
          
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs"
            >
              <Link to={`/sectors/${sector.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('view')}
              </Link>
            </Button>
            
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(sector)}
                className="text-xs"
              >
                {t('edit')}
              </Button>
            )}
            
            {onManageAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onManageAdmin(sector)}
                className="text-xs"
              >
                {t('admin')}
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(sector)}
              >
                {t('delete')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorCard;
