
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ExportButtonProps {
  onExport: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExport, 
  variant = 'outline',
  size = 'default',
  className
}) => {
  const { t } = useLanguage();

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={onExport}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {t('export')}
    </Button>
  );
};
