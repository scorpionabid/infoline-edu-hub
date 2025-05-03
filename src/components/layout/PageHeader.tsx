
import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  // Əlavə olaraq heading və subheading adları ilə də istifadə oluna bilər
  heading?: string;
  subheading?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  heading,
  description, 
  subheading,
  children 
}) => {
  // heading və title eyni məqsədlə istifadə olunur
  const displayTitle = heading || title;
  // subheading və description eyni məqsədlə istifadə olunur
  const displayDescription = subheading || description;
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{displayTitle}</h1>
        {displayDescription && (
          <p className="text-muted-foreground">{displayDescription}</p>
        )}
      </div>
      {children && (
        <div>{children}</div>
      )}
    </div>
  );
};

// Həm default export, həm də adlı export təmin edirik
export default PageHeader;
export { PageHeader };
