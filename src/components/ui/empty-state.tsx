
import React from 'react';
import { School, FileText, Map, FileInput, Users, Files } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  school: <School className="h-10 w-10 text-muted-foreground" />,
  file: <FileText className="h-10 w-10 text-muted-foreground" />,
  map: <Map className="h-10 w-10 text-muted-foreground" />,
  input: <FileInput className="h-10 w-10 text-muted-foreground" />,
  users: <Users className="h-10 w-10 text-muted-foreground" />,
  files: <Files className="h-10 w-10 text-muted-foreground" />,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'file',
  className,
}) => {
  return (
    <div className={`py-12 flex flex-col items-center justify-center text-center ${className}`}>
      <div className="rounded-full bg-muted p-4 mb-4">
        {iconMap[icon] || iconMap.file}
      </div>
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
