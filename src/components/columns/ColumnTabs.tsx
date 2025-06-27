import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ColumnTabsProps {
  activeTab: 'active' | 'archived';
  onTabChange: (tab: 'active' | 'archived') => void;
  activeCount: number;
  archivedCount: number;
}

const ColumnTabs: React.FC<ColumnTabsProps> = ({
  activeTab,
  onTabChange,
  activeCount,
  archivedCount
}) => {
  return (
    <div className="flex items-center space-x-1 mb-6">
      <Button
        variant={activeTab === 'active' ? 'default' : 'ghost'}
        onClick={() => onTabChange('active')}
        className={cn(
          "relative",
          activeTab === 'active' && "bg-primary text-primary-foreground"
        )}
      >
        Aktiv Sütunlar
        {activeCount > 0 && (
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 text-xs",
              activeTab === 'active' ? "bg-primary-foreground text-primary" : "bg-muted"
            )}
          >
            {activeCount}
          </Badge>
        )}
      </Button>
      
      <Button
        variant={activeTab === 'archived' ? 'default' : 'ghost'}
        onClick={() => onTabChange('archived')}
        className={cn(
          "relative",
          activeTab === 'archived' && "bg-primary text-primary-foreground"
        )}
      >
        Arxiv
        {archivedCount > 0 && (
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 text-xs",
              activeTab === 'archived' ? "bg-primary-foreground text-primary" : "bg-muted"
            )}
          >
            {archivedCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default ColumnTabs;