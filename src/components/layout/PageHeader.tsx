
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  description?: string;
  backButtonUrl?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backButtonUrl,
  children
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b">
      <div className="flex flex-col">
        {backButtonUrl && (
          <Button
            variant="link"
            className="p-0 h-auto font-normal flex items-center gap-1 mb-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(backButtonUrl)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Geri qayıt</span>
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-2 ml-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
