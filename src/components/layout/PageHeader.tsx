
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string; // geriye uyğunluq üçün
  heading?: string; // title ilə eynidir - geriye uyğunluq
  subheading?: string; // subtitle ilə eynidir - geriye uyğunluq
  backButtonUrl?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  heading,
  subheading,
  backButtonUrl,
  // children
}) => {
  const navigate = useNavigate();
  
  // heading və title, subtitle və subheading arasında uyğunluğun təmin edilməsi
  const displayTitle = title || heading || '';
  const displaySubtitle = subtitle || description || subheading || '';

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
        <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
        {displaySubtitle && (
          <p className="text-muted-foreground mt-1">{displaySubtitle}</p>
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
