
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegionHeaderProps {
  t: (key: string) => string;
  onAddRegion: () => void;
}

const RegionHeader: React.FC<RegionHeaderProps> = ({ t, onAddRegion }) => (
  <div className="flex justify-between items-center">
    <div>
      <div className="flex items-center gap-2">
        <Link to="/dashboard">
          <Button variant="outline" size="icon" title={t('backToDashboard')}>
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t('regions')}</h1>
      </div>
      <p className="text-muted-foreground">{t('regionsDescription')}</p>
    </div>
    <Button onClick={onAddRegion}>
      <PlusCircle className="mr-2 h-4 w-4" /> {t('addRegion')}
    </Button>
  </div>
);

export default RegionHeader;
