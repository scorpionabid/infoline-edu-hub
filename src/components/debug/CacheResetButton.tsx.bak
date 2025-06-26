
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { performFullCacheReset } from '@/utils/cleanupUtils';

const CacheResetButton: React.FC = () => {
  const handleCacheReset = () => {
    if (window.confirm('Bütün cache məlumatları silinəcək və səhifə yenidən yüklənəcək. Davam etmək istəyirsiniz?')) {
      performFullCacheReset();
    }
  };

  return (
    <Button 
      onClick={handleCacheReset}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Cache Təmizlə
    </Button>
  );
};

export default CacheResetButton;
