
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  backButtonUrl?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backButtonUrl,
  actions,
  className,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backButtonUrl) {
      navigate(backButtonUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("pb-4 mb-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {backButtonUrl !== undefined && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick}
                className="mr-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <Separator className="mt-4" />
    </div>
  );
};

export default PageHeader;
