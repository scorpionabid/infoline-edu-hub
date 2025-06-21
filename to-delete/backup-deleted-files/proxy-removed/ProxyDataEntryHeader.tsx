import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Building, Info } from 'lucide-react';

interface ProxyDataEntryHeaderProps {
  schoolName?: string;
  categoryName?: string;
  onClose?: () => void;
}

const ProxyDataEntryHeader: React.FC<ProxyDataEntryHeaderProps> = ({
  schoolName,
  categoryName,
  onClose
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Məlumat daxil etmə</h2>
          <p className="text-muted-foreground mt-1">
            Sektor admini kimi məktəb adına məlumat daxil edirsiniz
          </p>
        </div>
        
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        )}
      </div>

      <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Məktəb</p>
            <p className="text-sm text-muted-foreground">
              {schoolName || 'Yüklənir...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Kateqoriya</p>
            <p className="text-sm text-muted-foreground">
              {categoryName || 'Yüklənir...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-blue-600">
          <Info className="w-4 h-4" />
          <p className="text-sm">Proxy məlumat daxiletməsi</p>
        </div>
      </div>
    </div>
  );
};

export default ProxyDataEntryHeader;
